"""
Topological Sort & Circular Dependency (SCC) Analyzer for Metamorph.
Uses NetworkX to compute:
1. Migration Order: Leaf files first (no internal dependencies), entry point last.
2. Strongly Connected Components (SCC) via Tarjan's algorithm to detect circular imports.
"""
from __future__ import annotations

from typing import Dict, List, Tuple
import networkx as nx


class TopoPlanner:
    def __init__(self, dep_graph: Dict[str, List[str]]):
        """
        dep_graph: { 'app.js': ['routes/users.js', 'middleware/auth.js'] }
        Note: If 'app.js' imports 'routes/users.js', then 'routes/users.js'
        must be migrated BEFORE 'app.js'.
        Edge in DAG: dependency -> consumer (i.e. 'routes/users.js' -> 'app.js')
        """
        self.dep_graph = dep_graph
        self.graph = nx.DiGraph()

        # Add all nodes
        for node in dep_graph:
            self.graph.add_node(node)

        # Add directed edges: dependency -> dependent (must migrate dependency first)
        for dependent, dependencies in dep_graph.items():
            for dep in dependencies:
                if dep in dep_graph:
                    self.graph.add_edge(dep, dependent)

    def analyze_plan(self) -> Tuple[List[str], List[List[str]], List[dict]]:
        """
        Returns:
            ordered_files: Flat list of files in execution order
            cycles: List of circular dependency groups (SCCs of size > 1)
            detailed_steps: List of step dictionaries with dependency metadata
        """
        # 1. Detect cycles via Strongly Connected Components
        sccs = list(nx.strongly_connected_components(self.graph))
        cycles = [sorted(list(scc)) for scc in sccs if len(scc) > 1]

        # 2. Build Condensation Graph if cycles exist, else direct topological sort
        if not cycles:
            try:
                ordered_files = list(nx.topological_sort(self.graph))
            except nx.NetworkXUnfeasible:
                ordered_files = list(self.dep_graph.keys())
        else:
            # Condense cycles into super-nodes to find ordering of components
            condensed = nx.condensation(self.graph)
            ordered_files = []
            for comp_id in nx.topological_sort(condensed):
                members = sorted(list(condensed.nodes[comp_id]["members"]))
                ordered_files.extend(members)

        # 3. Create detailed migration step descriptions for Frontend & Graph UI
        detailed_steps = []
        for idx, file_path in enumerate(ordered_files, start=1):
            is_in_cycle = any(file_path in cycle for cycle in cycles)
            cycle_peers = []
            if is_in_cycle:
                for cycle in cycles:
                    if file_path in cycle:
                        cycle_peers = [f for f in cycle if f != file_path]
                        break

            detailed_steps.append({
                "step": idx,
                "file": file_path,
                "imports": self.dep_graph.get(file_path, []),
                "imported_by": [dependent for dependent, deps in self.dep_graph.items() if file_path in deps],
                "is_in_cycle": is_in_cycle,
                "cycle_peers": cycle_peers,
                "is_leaf": len(self.dep_graph.get(file_path, [])) == 0,
            })

        return ordered_files, cycles, detailed_steps
