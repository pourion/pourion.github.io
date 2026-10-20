export type Lane = 'astro' | 'hpc' | 'ai' | 'bio' | 'chip';

export interface LaneMeta {
  label: string;
  color: string;
  cssVar: string;
  /** Year from which the lane is "passively monitored" — renders a dashed continuation. */
  passiveAfter?: number;
}

export const LANES: Record<Lane, LaneMeta> = {
  astro: { label: 'Astrophysics & cosmology',    color: '#E63946', cssVar: 'var(--lane-astro)' },
  hpc:   { label: 'Numerical methods & HPC',     color: '#4CC9F0', cssVar: 'var(--lane-hpc)' },
  ai:    { label: 'AI for simulation',           color: '#FFB703', cssVar: 'var(--lane-ai)' },
  bio:   { label: 'Biophysics & life sciences',  color: '#80ED99', cssVar: 'var(--lane-bio)', passiveAfter: 2024 },
  chip:  { label: 'Chip design & semiconductors', color: '#B388EB', cssVar: 'var(--lane-chip)' },
};

export const LANE_ORDER: Lane[] = ['astro', 'hpc', 'ai', 'bio', 'chip'];

export interface Milestone {
  id: string;
  year: number;
  /** End year for multi-year "chapter" milestones (renders a bar on the lane). Omit for point events. */
  endYear?: number;
  yearLabel: string;
  lanes: Lane[];
  primaryLane: Lane;
  title: string;
  org: string;
  role?: string;
  short: string;
  long: string;
  image?: string;
  links?: { label: string; href: string }[];
  /** Marks milestones where Pouria was a founding engineer / built a team from zero. */
  founding?: boolean;
}

export const MILESTONES: Milestone[] = [
  {
    id: 'illustris',
    year: 2013,
    endYear: 2016,
    yearLabel: '2013 – 2016',
    lanes: ['astro', 'hpc'],
    primaryLane: 'astro',
    title: 'Illustris · dwarf galaxies',
    org: 'UC Riverside',
    role: 'Graduate Research Assistant',
    short: 'I developed a theory of dwarf-galaxy formation and analyzed terabytes of data from the Illustris cosmological simulations. This project was my introduction to large-scale numerical simulation.',
    long: 'At UC Riverside I developed a theory for the formation of dwarf galaxies and analyzed terabytes of cosmological data from the Illustris Simulation Suite. Illustris is one of the largest cosmological N-body and hydrodynamics simulations performed to date. My training in numerical methods and high-performance computing began with this project, which also produced my first peer-reviewed publication, in MNRAS. Since then my research has addressed how to build simulations of comparable scale and fidelity for physical systems in other domains.',
    image: '/img/illustris.png',
    links: [
      { label: 'Illustris project', href: 'https://www.illustris-project.org/' },
      { label: 'MNRAS paper', href: 'https://academic.oup.com/mnras/article/455/3/2323/991525' },
    ],
  },
  {
    id: 'mnras-2016',
    year: 2016,
    yearLabel: '2016',
    lanes: ['astro'],
    primaryLane: 'astro',
    title: 'MNRAS · dwarf galaxies & globular clusters',
    org: 'Monthly Notices of the Royal Astronomical Society',
    role: 'Lead author',
    short: 'The paper predicted enhanced globular-cluster formation in starburst environments. Later observations have confirmed this prediction several times.',
    long: 'In this lead-author MNRAS paper we studied the assembly of dwarf galaxies in galaxy clusters and the efficiency with which they form globular clusters. The analysis predicted an excess of globular-cluster formation in active, starburst-driven environments. Several later observations, by NASA and other observatories, have confirmed this prediction. The paper concluded my work in astrophysics. My subsequent research at UC Santa Barbara focused on numerical methods for simulation.',
    image: '/img/mnras.png',
    links: [
      { label: 'MNRAS paper', href: 'https://academic.oup.com/mnras/article/455/3/2323/991525' },
    ],
  },
  {
    id: 'ucsb-phd',
    year: 2016,
    endYear: 2020,
    yearLabel: '2016 – 2020',
    lanes: ['hpc', 'bio'],
    primaryLane: 'hpc',
    title: 'PhD · UCSB · level-set PDE methods',
    org: 'UC Santa Barbara',
    role: 'Graduate Research Assistant · CASL Lab',
    short: 'I wrote two parallel C++/MPI simulation codes, one for the electroporation of cell aggregates and one for epitaxial growth.',
    long: 'I completed a PhD in Mechanical Engineering with an emphasis in Computational Science and Engineering. My thesis research was on level-set methods for elliptic partial differential equations with irregular free boundaries. I wrote two parallel C++/MPI simulation codes, one for the electroporation of cell aggregates and one for epitaxial growth. Both codes were published in the Journal of Computational Physics. I also developed a reduced-order stochastic theory for the interfacial polarization of cell aggregates. The same level-set methods are used to model epitaxy, etching and lithography in semiconductor manufacturing.',
    image: '/img/Dirichlet_L1000_proc_zoom.png',
  },
  {
    id: 'epitaxy-2017',
    year: 2017,
    yearLabel: '2017 – 2018',
    lanes: ['hpc'],
    primaryLane: 'hpc',
    title: 'Epitaxy · island dynamics on quadtree grids',
    org: 'UCSB · CASL Lab',
    role: 'Lead author',
    short: 'A parallel simulator of epitaxial thin-film growth based on the island dynamics model and level-set methods.',
    long: 'This lead-author paper, "The island dynamics model on parallel quadtree grids", was published in the Journal of Computational Physics in 2018. It describes a parallel C++/MPI simulator for epitaxial thin-film growth based on the island dynamics model. The method uses a second-order level-set discretization on non-graded adaptive Cartesian grids. Robin boundary conditions represent asymmetric Ehrlich–Schwoebel barriers. The same numerical methods apply to other processes in semiconductor manufacturing, such as etching and lithography, and they are the basis of my later work on chip design.',
    image: '/img/epitaxy.png',
    links: [
      { label: 'JCP paper', href: 'https://www.sciencedirect.com/science/article/abs/pii/S0021999118300767' },
    ],
  },
  {
    id: 'pinn-investigation-2017',
    year: 2017,
    yearLabel: '2017',
    lanes: ['ai', 'hpc'],
    primaryLane: 'ai',
    title: 'Physics-aware neural networks',
    org: 'UCSB · CASL Lab',
    role: 'Researcher',
    short: 'During my PhD I began to study neural networks that incorporate the governing equations. This work led to BiPDE and JAX-DIPS.',
    long: 'During my PhD I began to study neural networks that incorporate the structure of the governing equations. I examined how numerical discretizations of partial differential equations can be embedded directly in network layers. I also studied hybrid optimization for surrogate models and early forms of neural operators. This line of research led to BiPDE (Journal of Computational Physics, 2021) and JAX-DIPS (Journal of Computational Physics, 2023). I continued it at NVIDIA in collaboration with the Modulus team.',
    image: '/img/nbm2.png',
  },
  {
    id: 'avicenna',
    year: 2018,
    yearLabel: '2018 – 2019',
    lanes: ['hpc', 'bio'],
    primaryLane: 'hpc',
    title: 'AVICENNA · tissue-scale simulation',
    org: 'UCSB · CASL Lab',
    role: 'Co-investigator',
    short: 'The first parallel, multiscale 3D simulation code for electroporation at tissue scale. Simulations were run on national supercomputers.',
    long: 'I designed AVICENNA, the first parallel, multiscale, multiphysics simulation code for three-dimensional tissue. We used it to simulate electroporation at tissue scale on national supercomputers. The model resolves ion concentrations, the electropermeabilization of cell membranes and the dynamics of cell aggregates. The method was published in the Journal of Computational Physics in 2019. The work was featured by the U.S. Army Research Laboratory, TACC and XSEDE, and it was covered by HPCwire, EurekAlert, Phys.org, Science Daily and Futurity.',
    image: '/img/2_EP.jpg',
    links: [
      { label: 'JCP paper (2019)', href: 'https://www.sciencedirect.com/science/article/abs/pii/S0021999118308052' },
    ],
  },
  {
    id: 'bipde',
    year: 2021,
    yearLabel: '2021',
    lanes: ['ai', 'hpc'],
    primaryLane: 'ai',
    title: 'BiPDE · physics-aware neural networks',
    org: 'Journal of Computational Physics',
    role: 'Co-author',
    short: 'A neural network that contains a numerical PDE solver as one of its layers, applied to inverse problems.',
    long: 'BiPDE (blended inverse-PDE) is a framework in which a numerical PDE solver is implemented as a custom layer inside a semantic autoencoder. In standard physics-informed neural networks, the PDE enters only as a residual term in the loss function. We used BiPDE to recover variable diffusion coefficients in one- and two-dimensional Poisson problems and in the time-dependent, nonlinear Burgers equation. The recovery was robust to noise in the data. The paper was published in the Journal of Computational Physics in 2021, and the preprint appeared on arXiv in January 2020.',
    image: '/img/ElectroFluct.png',
    links: [
      { label: 'arXiv (2020)', href: 'https://arxiv.org/abs/2001.03608' },
      { label: 'JCP paper', href: 'https://www.sciencedirect.com/science/article/abs/pii/S0021999121003090' },
    ],
  },
  {
    id: 'jax-dips',
    year: 2022,
    yearLabel: '2022',
    lanes: ['hpc', 'ai'],
    primaryLane: 'hpc',
    title: 'JAX-DIPS · differentiable PDE solver',
    org: 'Open source · lead developer',
    role: 'Creator',
    short: 'A differentiable 3D solver for interfacial PDEs, written in JAX. It runs on GPUs, TPUs and CPUs.',
    long: 'I developed JAX-DIPS and released it as open-source software. It is a differentiable solver for three-dimensional interfacial PDEs, written in JAX, and it runs on GPUs, TPUs and CPUs. The solver trains compact neural networks to solve elliptic problems with jump conditions at interfaces. Such problems are common in the life sciences and in materials science. The core of the solver is the neural bootstrapping method (NBM) for finite discretization methods. The method was published in the Journal of Computational Physics in 2023. A related neuro-symbolic PDE solver was presented at the NeurIPS 2022 workshop on Machine Learning and the Physical Sciences.',
    image: '/img/jaxdips.png',
    links: [
      { label: 'GitHub', href: 'https://github.com/JAX-DIPS/JAX-DIPS' },
      { label: 'JCP paper', href: 'https://doi.org/10.1016/j.jcp.2023.112480' },
    ],
  },
  {
    id: 'merck',
    year: 2020,
    endYear: 2021,
    yearLabel: '2020 – 2021',
    lanes: ['bio', 'hpc'],
    primaryLane: 'bio',
    title: 'Postdoc · biotherapeutics HPC',
    org: 'Merck Research Laboratories',
    role: 'Postdoctoral Research Fellow',
    short: 'A CUDA/C++ Monte Carlo code for the second virial coefficient of biologics, and a continuum model of protein aggregation.',
    long: 'As a postdoctoral fellow at Merck, I developed a CUDA/C++ Monte Carlo code that uses Mayer sampling to compute the second virial coefficient of biologics. I also proposed a continuum mathematical model for protein aggregation at high concentrations. Merck Research Laboratories awarded me a $75,000 seed grant to build an HPC platform for protein aggregation. The platform was intended as a basis for simulating biotherapeutic formulations at industrial scale.',
  },
  {
    id: 'nvidia',
    year: 2021,
    endYear: 2023,
    yearLabel: '2021 – 2023',
    lanes: ['ai', 'hpc', 'bio'],
    primaryLane: 'ai',
    title: 'NVIDIA · Clara, Modulus, Warp',
    org: 'NVIDIA · AI & HPC',
    role: 'Senior Software Engineer',
    short: 'First technical hire on the Clara Discovery simulation team. I helped grow the team to 14 engineers and researchers.',
    long: 'I was the first technical hire on NVIDIA\'s Clara Discovery simulation team, which developed AI-driven simulation methods for drug discovery. I helped establish the team\'s simulation capabilities and grow it to 14 engineers and researchers. I implemented DiffDock, a score-based diffusion model built on 3D-equivariant graph neural networks, in the BioNeMo framework. I also developed GPU-optimized molecular dynamics driven by machine-learned interaction potentials. The implementation achieved a 5-fold speed-up and a 10-fold improvement in memory efficiency. In addition, I designed and led AI-accelerated simulations of macromolecular stability and solvation free energy. This work was done in collaboration with the NVIDIA Modulus (physics-ML), Warp (differentiable GPU simulation) and Clara teams.',
    image: '/img/nvidia-clara.png',
    founding: true,
  },
  {
    id: 'genentech',
    year: 2023,
    yearLabel: 'Jul – Oct 2023',
    lanes: ['bio', 'ai'],
    primaryLane: 'bio',
    title: 'Prescient Design · protein design',
    org: 'Genentech',
    role: 'ML Scientist',
    short: 'A short appointment working on therapeutic protein design.',
    long: 'I worked briefly with the Prescient Design group on therapeutic protein design. The work showed me which problems in AI for drug design were ready for practical use and which were not. After this appointment I chose chip design as the next domain for my work on large-scale physics simulation and AI.',
  },
  {
    id: 'aikium',
    year: 2024,
    yearLabel: 'Jan – Apr 2024',
    lanes: ['ai', 'bio'],
    primaryLane: 'ai',
    title: 'Multi-objective DPO for protein design',
    org: 'Aikium',
    role: 'Principal Deep Learning Scientist',
    short: 'I developed the multi-objective preference optimization algorithm that is now the basis of Aikium\'s production drug-design platform.',
    long: 'I was a founding member of Aikium\'s computational team. Over four months I developed a multi-objective direct preference optimization (DPO) algorithm for protein and molecule language models and filed three provisional patents on it. After I left, other members of the team extended the method. About two years later, the algorithm became the basis of Aikium\'s production drug-design platform. The method was published at the ICLR 2024 GEM workshop. I also built a retrieval-augmented generation (RAG) pipeline for protein-design knowledge.',
    image: '/img/dpo_aikium.png',
    founding: true,
    links: [
      { label: 'ICLR 2024 GEM paper', href: 'https://openreview.net/forum?id=qHIcWfgvIH' },
      { label: 'Aikium platform', href: 'https://www.aikium.com/' },
    ],
  },
  {
    id: 'synopsys',
    year: 2024,
    endYear: 2025,
    yearLabel: '2024 – 2025',
    lanes: ['chip', 'ai', 'hpc'],
    primaryLane: 'chip',
    title: 'Synopsys · founding engineer, GenAI Solutions',
    org: 'Synopsys',
    role: 'Senior Staff AI Engineer',
    short: 'Founding engineer of the GenAI Solutions team. I worked on a GenAI SDK, a multi-agent EDA framework and circuit foundation models, and I am lead inventor on the patent application for the framework.',
    long: 'I was a founding engineer of the GenAI Solutions team at Synopsys. I designed and delivered an internal GenAI software development kit, based on retrieval-augmented generation and agents, that was used by several business units. I also designed a multi-agent framework for electronic design automation (EDA) workflows, and I am the lead inventor on the Synopsys patent application for this framework. I was the technical lead of a cross-functional project on foundation models for physical circuit design. For this project I developed a circuit tokenization scheme modeled on the SMILES representation of molecules. I also developed a recommender system for tuning the parameters of EDA simulators. The system combines reinforcement learning, transformers and hypergraph neural networks. I received the Engineering Excellence Group Individual Award, selected from approximately 2,000 engineers, for contributions to the company\'s GenAI strategy.',
    image: '/img/synopsys-agents.svg',
    founding: true,
  },
  {
    id: 'voltai',
    year: 2025,
    endYear: 2026,
    yearLabel: '2025 – now',
    lanes: ['chip', 'hpc', 'ai'],
    primaryLane: 'chip',
    title: 'Voltaire · agentic multiphysics for 3D-IC',
    org: 'Voltai',
    role: 'Platform Lead · Member of Technical Staff',
    short: 'I conceived and lead Voltaire, a multiphysics simulation platform for 3D-IC design. GPU-accelerated first-principles solvers form its core, and AI agents coordinate the simulation workflow.',
    long: 'I am the platform lead for Voltaire, Voltai\'s agentic multiphysics platform for the design and simulation of three-dimensional integrated circuits (3D-ICs). The project started from the hypothesis that semiconductor engineering requires a computational approach that combines advances in numerical methods, accelerated computing and agentic AI. The core of the platform consists of first-principles solvers for coupled electrical, thermal and mechanical behavior. The solvers use GPU direct sparse factorization (NVIDIA cuDSS) and are optimized for current GPU architectures. This design increases performance while preserving the numerical accuracy and physical fidelity that semiconductor design requires. AI agents operate around the solvers. They select solution methods, allocate computational resources, verify results and explore design alternatives in parallel. The approach is neurosymbolic in spirit, because the physics is computed by numerical solvers and the agents automate the engineering workflow around them. I conceived the platform, built the initial implementation, defined its architecture and assembled a team with expertise in AI, computational science and semiconductor engineering. I continue to contribute to the core code. On eight NVIDIA H100 GPUs, the electromagnetic extraction pipeline runs 32 times faster than on a 64-CPU baseline at the same accuracy.',
    image: '/img/sky130_fd_sc_hd__sedfxbp_2-transparent.png',
    founding: true,
    links: [
      { label: 'Voltai announcement', href: 'https://voltai.com/blog/voltai-nvidia-voltaire-3d-ic-design' },
      { label: 'NVIDIA · SEMICON West 2026', href: 'https://nvidianews.nvidia.com/news/nvidia-and-semiconductor-leaders-advance-ai-across-chip-design-and-manufacturing-for-ai-defined-labs' },
    ],
  },
  {
    id: 'voltaire-announcement',
    year: 2026,
    yearLabel: 'Oct 2026',
    lanes: ['chip', 'hpc', 'ai'],
    primaryLane: 'chip',
    title: 'Voltaire announced with NVIDIA',
    org: 'SEMICON West 2026',
    role: 'Platform Lead · Voltai',
    short: 'Voltai announced Voltaire publicly in October 2026. NVIDIA described the platform in its SEMICON West press release.',
    long: 'In October 2026 Voltai announced Voltaire publicly, in an article of which I am the first author. The article reports that the electromagnetic extraction pipeline runs 32 times faster on eight NVIDIA H100 GPUs than on a 64-CPU baseline at the same accuracy. On 14 October 2026, NVIDIA issued a press release for SEMICON West on AI in chip design and manufacturing. The release describes Voltaire as an agentic multiphysics platform for 3D-IC design that combines AI agents with GPU-accelerated solvers based on NVIDIA cuDSS and CUDA-X libraries. According to the release, the platform reduces electro-thermal-mechanical simulation workflows from months to a day.',
    links: [
      { label: 'Voltai announcement', href: 'https://voltai.com/blog/voltai-nvidia-voltaire-3d-ic-design' },
      { label: 'NVIDIA press release', href: 'https://nvidianews.nvidia.com/news/nvidia-and-semiconductor-leaders-advance-ai-across-chip-design-and-manufacturing-for-ai-defined-labs' },
    ],
  },
  {
    id: 'aggregation-2026',
    year: 2026,
    yearLabel: '2026',
    lanes: ['bio', 'hpc'],
    primaryLane: 'bio',
    title: 'Free-boundary model of protein aggregation',
    org: 'arXiv preprint · submitted to J. Phys. Chem. B',
    role: 'Author',
    short: 'A spatially resolved, level-set extension of nucleated polymerization. It continues the work on protein aggregation that I began at Merck.',
    long: 'This preprint returns to the problem of protein aggregation that I began to study at Merck. Kinetic models of aggregation usually describe aggregate populations by size alone. I extend Lumry–Eyring nucleated polymerization to a spatially resolved model in which the monomer is a density field and each aggregate is a region bounded by a level set. The collision efficiency and the Fuchs stability ratio are computed from Wertheim\'s perturbation theory without fitted parameters. In the well-mixed limit, the spatial averages of the model satisfy the classical rate equations term by term. The computed stability ratio reproduces thirteen of fourteen published conditions for a monoclonal antibody when the bond rate is taken at the upper end of its range. The level-set methods used in this work are those I developed during my PhD.',
    links: [
      { label: 'arXiv:2609.27185', href: 'https://arxiv.org/abs/2609.27185' },
    ],
  },
  {
    id: 'stencil-pub',
    year: 2026,
    yearLabel: '2026',
    lanes: ['ai', 'hpc'],
    primaryLane: 'ai',
    title: 'Stencil · open journal and agent plugin',
    org: 'stencil.pub',
    role: 'Founder & editor',
    short: 'An open, community-run journal of physics simulation. A companion plugin makes the methods of each essay available to coding agents such as Claude Code and Codex.',
    long: 'I founded stencil.pub, an open journal of physics simulation that is owned by its community. The journal has a companion plugin for coding agents such as Claude Code and Codex. Coding agents now write a large share of new software, and the journal is based on the view that they should also be able to set up and run physical simulations correctly. Each essay includes the skills, worked examples and verifiable reports that its author chooses to publish. These are collected in a single versioned plugin in which each contribution is attributed to its author. The aim is that the methods described in a paper can be executed directly by later researchers and by agents.',
    image: '/img/stencil-pub-logo.svg',
    founding: true,
    links: [
      { label: 'stencil.pub', href: 'https://stencil.pub' },
      { label: 'Plugin (GitHub)', href: 'https://github.com/stencil-pub/stencil' },
    ],
  },
];
