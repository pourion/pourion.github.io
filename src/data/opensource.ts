// Public open-source work shown on /open-source.
// Only public repositories. Work in private repositories (Voltai, Examorphic) is never listed.
// Only merged pull requests and the issues they fixed are listed as contributions.

export interface OssLink {
  label: string;
  href: string;
}

export interface Contribution {
  project: string;
  projectHref: string;
  date: string;
  title: string;
  status: string;
  paragraphs: string[];
  links: OssLink[];
}

export interface Library {
  name: string;
  role: string;
  years: string;
  paragraphs: string[];
  links: OssLink[];
}

export const CONTRIBUTIONS: Contribution[] = [
  {
    project: 'AMReX',
    projectHref: 'https://github.com/AMReX-Codes/amrex',
    date: 'Oct 2026',
    title: 'Race-free GPU Gauss–Seidel smoothing at cut cells in MLEBABecLap',
    status: 'Merged · approved by Weiqun Zhang',
    paragraphs: [
      'In the embedded-boundary linear solver of AMReX (MLEBABecLap), the red–black Gauss–Seidel smoother reads diagonal neighbours of a cut cell during face-centroid flux interpolation and in the Dirichlet boundary gradient. These neighbours have the same red–black parity as the cell being updated. On a GPU, a thread can therefore read a value that another thread of the same launch is writing, and the result depends on thread scheduling. I reported the race in issue #6092.',
      'The pull request adds an opt-in deterministic mode, enabled with LPInfo::setDeterministic(true), in which each half-sweep is split into 2^(D−1) colours so that no two cells in a 3 × 3 × 3 neighbourhood share a colour. The default path is unchanged. On an NVIDIA RTX A6000, repeated multigrid solves in deterministic mode were bitwise identical in every tested configuration, and the solve time changed by −1 to +37 per cent.',
    ],
    links: [
      { label: 'Pull request #6093', href: 'https://github.com/AMReX-Codes/amrex/pull/6093' },
      { label: 'Issue #6092', href: 'https://github.com/AMReX-Codes/amrex/issues/6092' },
    ],
  },
  {
    project: 'VERL',
    projectHref: 'https://github.com/verl-project/verl',
    date: 'Oct 2025',
    title: 'LoRA weight synchronization in the FSDP workers',
    status: 'Merged',
    paragraphs: [
      'With LoRA enabled and the base weights already synchronized, the FSDP workers in VERL passed the per-tensor parameters to the bucketing routine as a dictionary. The routine expects an iterator of (name, tensor) pairs, so weight synchronization failed with a ValueError. The fix passes params.items().',
    ],
    links: [
      { label: 'Pull request #3712', href: 'https://github.com/verl-project/verl/pull/3712' },
    ],
  },
];

export const LIBRARIES: Library[] = [
  {
    name: 'JAX-DIPS',
    role: 'Lead developer',
    years: '2021 – now',
    paragraphs: [
      'A differentiable solver for three-dimensional interfacial PDEs, written in JAX. It runs on GPUs, TPUs and CPUs. The solver trains compact neural networks to solve elliptic problems with jump conditions at interfaces, using neural bootstrapping of finite discretization methods.',
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/JAX-DIPS/JAX-DIPS' },
      { label: 'J. Comput. Phys. (2023)', href: 'https://doi.org/10.1016/j.jcp.2023.112480' },
    ],
  },
  {
    name: 'Stencil plugin',
    role: 'Founder',
    years: '2026 – now',
    paragraphs: [
      'The companion plugin of the Stencil journal for coding agents such as Claude Code and Codex. Each essay contributes skills, worked examples and verifiable reports for physics simulation, and the plugin collects them in one versioned package in which each contribution is attributed to its author.',
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/stencil-pub/stencil' },
      { label: 'stencil.pub', href: 'https://stencil.pub' },
    ],
  },
];
