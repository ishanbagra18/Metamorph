"""
Repository Management Service for Metamorph.
Handles:
- ZIP unpacking & Git repository cloning
- Dual-copy workspace isolation (original vs migrated)
- Unified diff generation between JS and TS versions
- Final migrated ZIP packager
"""
from __future__ import annotations

import difflib
import os
import shutil
import subprocess
import zipfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from app.config import settings


class RepoService:
    @staticmethod
    def create_workspace(run_id: str) -> Tuple[Path, Path]:
        """
        Creates isolated run directories:
        workspaces/<run_id>/original
        workspaces/<run_id>/migrated
        """
        base = Path(settings.WORKSPACES_DIR) / run_id
        original = base / "original"
        migrated = base / "migrated"

        original.mkdir(parents=True, exist_ok=True)
        migrated.mkdir(parents=True, exist_ok=True)
        return original, migrated

    @staticmethod
    def extract_zip(zip_path: str, target_dir: Path):
        """Extracts ZIP file safely into target_dir."""
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Handle repos zipped with an outer root folder
            namelist = zip_ref.namelist()
            top_level = {p.split('/')[0] for p in namelist if '/' in p}
            
            zip_ref.extractall(target_dir)

            # If all files are inside a single root dir, flatten it
            if len(top_level) == 1 and all(p.startswith(list(top_level)[0] + "/") or p == list(top_level)[0] + "/" for p in namelist):
                single_folder = target_dir / list(top_level)[0]
                if single_folder.is_dir():
                    for item in single_folder.iterdir():
                        shutil.move(str(item), str(target_dir))
                    shutil.rmtree(str(single_folder), ignore_errors=True)

    @staticmethod
    def clone_git_repo(git_url: str, target_dir: Path, branch: Optional[str] = None):
        """Clones a public Git repository with --depth 1."""
        cmd = ["git", "clone", "--depth", "1"]
        if branch:
            cmd.extend(["-b", branch])
        cmd.extend([git_url, str(target_dir)])

        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode != 0:
            raise RuntimeError(f"Git clone failed: {proc.stderr}")

    @staticmethod
    def duplicate_for_migration(original_dir: Path, migrated_dir: Path):
        """Duplicates original into migrated workspace, excluding node_modules/git."""
        def ignore_patterns(path, names):
            return {"node_modules", ".git", "dist", "build", "coverage", ".next"}

        shutil.copytree(str(original_dir), str(migrated_dir), ignore=ignore_patterns, dirs_exist_ok=True)

    @staticmethod
    def generate_diff(original_code: str, migrated_code: str, old_filename: str, new_filename: str) -> str:
        """Generates unified diff between original JS and new TS code."""
        old_lines = original_code.splitlines(keepends=True)
        new_lines = migrated_code.splitlines(keepends=True)
        diff = difflib.unified_diff(
            old_lines,
            new_lines,
            fromfile=old_filename,
            tofile=new_filename
        )
        return "".join(diff)

    @staticmethod
    def package_migrated_zip(migrated_dir: Path, output_zip_path: Path) -> str:
        """Creates a downloadable ZIP of the migrated workspace."""
        output_zip_path.parent.mkdir(parents=True, exist_ok=True)
        
        with zipfile.ZipFile(str(output_zip_path), 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(migrated_dir):
                # Ignore heavy temp directories
                dirs[:] = [d for d in dirs if d not in {"node_modules", ".git", "dist", "build", ".next", "coverage"}]
                for file in files:
                    file_path = Path(root) / file
                    rel_path = file_path.relative_to(migrated_dir)
                    zipf.write(file_path, arcname=str(rel_path))

        return str(output_zip_path)
