export type Lane = 'astro' | 'hpc' | 'ai' | 'bio' | 'chip';

export const LANES: Record<Lane, { label: string; color: string; cssVar: string }> = {
  astro: { label: 'Astrophysics & cosmology',    color: '#E63946', cssVar: 'var(--lane-astro)' },
  hpc:   { label: 'Numerical methods & HPC',     color: '#4CC9F0', cssVar: 'var(--lane-hpc)' },
  ai:    { label: 'AI for simulation',           color: '#FFB703', cssVar: 'var(--lane-ai)' },
  bio:   { label: 'Biophysics & life sciences',  color: '#80ED99', cssVar: 'var(--lane-bio)' },
  chip:  { label: 'Chip design & semiconductors', color: '#B388EB', cssVar: 'var(--lane-chip)' },
};

export const LANE_ORDER: Lane[] = ['astro', 'hpc', 'ai', 'bio', 'chip'];

export interface Milestone {
  id: string;
  year: number;
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
}

export const MILESTONES: Milestone[] = [
  {
    id: 'illustris',
    year: 2013,
    yearLabel: '2013 – 2016',
    lanes: ['astro'],
    primaryLane: 'astro',
    title: 'Illustris · dwarf galaxies',
    org: 'UC Riverside',
    role: 'Graduate Research Assistant',
    short: 'Theory of dwarf-galaxy formation; terabytes of Illustris cosmological data.',
    long: 'Entry into large-scale numerical simulation. Developed a theory for the formation of dwarf galaxies and analyzed terabytes of cosmological data from the Illustris Simulation Suite — one of the largest cosmological N-body + hydrodynamics simulations ever run. First peer-reviewed publication in MNRAS. The experience set the lifelong question: how do you reproduce, in other domains, what Illustris achieved for the universe?',
    image: '/img/newCluster.png',
    links: [
      { label: 'Illustris project', href: 'https://www.illustris-project.org/' },
      { label: 'MNRAS paper', href: 'https://academic.oup.com/mnras/article/455/3/2323/991525' },
    ],
  },
  {
    id: 'ucsb-phd',
    year: 2016,
    yearLabel: '2016 – 2020',
    lanes: ['hpc'],
    primaryLane: 'hpc',
    title: 'PhD · UCSB · level-set PDE methods',
    org: 'UC Santa Barbara',
    role: 'Graduate Research Assistant · CASL Lab',
    short: 'Two parallel HPC simulation codebases in C++/MPI — cell-aggregate electroporation and epitaxial growth.',
    long: 'PhD in Mechanical Engineering / Computational Science & Engineering. Authored two state-of-the-art parallel HPC simulation codebases in C++/MPI — one for cell-aggregate electroporation, one for epitaxial growth — both published in the Journal of Computational Physics. Developed a reduced-order stochastic theory for interfacial polarization of cell aggregates. Specialized in level-set methods for irregular free-boundary elliptic PDEs — the same machinery that maps directly onto epitaxy, etching, and lithography in semiconductor manufacturing.',
    image: '/img/Dirichlet_L1000_proc_zoom.png',
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
    short: 'First parallel multi-scale 3D tissue simulation engine — cell-aggregate electroporation at supercomputer scale.',
    long: 'Architected AVICENNA — the first parallel, multi-scale, multi-physics 3D tissue simulation engine. Solved tissue-scale electroporation on national supercomputers, modeling ion concentrations, electro-permeabilization, and cell-aggregate dynamics. Featured by the U.S. Army Research Lab, TACC, and XSEDE; press coverage in HPCwire, EurekAlert, Phys.org, Science Daily, and Futurity.',
    image: '/img/2_EP.jpg',
  },
  {
    id: 'jax-dips',
    year: 2020,
    yearLabel: '2020 – 2023',
    lanes: ['hpc', 'ai'],
    primaryLane: 'hpc',
    title: 'JAX-DIPS',
    org: 'Open source · lead developer',
    role: 'Creator',
    short: 'Differentiable 3D interfacial PDE solver in JAX — runs on GPU/TPU/CPU.',
    long: 'Built and open-sourced JAX-DIPS — a differentiable 3D interfacial PDE solver in JAX that runs on GPU/TPU/CPU. Trains compact neural networks to solve elliptic PDEs with jump conditions, ubiquitous in life sciences and materials. The Neural Bootstrapping Method (NBM) for finite discretization is at the core. Published in Journal of Computational Physics, 2023.',
    image: '/img/0_dragons.png',
    links: [
      { label: 'GitHub', href: 'https://github.com/JAX-DIPS/JAX-DIPS' },
      { label: 'JCP paper', href: 'https://www.sciencedirect.com/science/article/pii/S0021999123005569' },
    ],
  },
  {
    id: 'merck',
    year: 2020,
    yearLabel: '2020 – 2021',
    lanes: ['bio', 'hpc'],
    primaryLane: 'bio',
    title: 'Postdoc · biotherapeutics HPC',
    org: 'Merck Research Laboratories',
    role: 'Postdoctoral Research Fellow',
    short: 'CUDA/C++ Monte Carlo for biologic second virial; continuum model for protein aggregation.',
    long: 'Postdoctoral fellow at Merck. Developed a CUDA/C++ Monte Carlo code using Mayer\'s sampling for the second virial coefficient of biologics, and proposed a continuum mathematical model for protein aggregation at high concentrations. Awarded a $75,000 seed grant by Merck Research Laboratories leadership to build an HPC platform for protein aggregation — the foundation for industrial-scale biotherapeutic formulation simulation.',
  },
  {
    id: 'nvidia',
    year: 2021,
    yearLabel: '2021 – 2023',
    lanes: ['ai', 'hpc', 'bio'],
    primaryLane: 'ai',
    title: 'NVIDIA · Clara, Modulus, Warp',
    org: 'NVIDIA · AI & HPC',
    role: 'Senior Software Engineer',
    short: 'Founding member of Clara Discovery Simulation; cross-functional across Modulus, Warp, and Clara.',
    long: 'Founding member of the Clara Discovery Simulation engineering team for AI-driven drug discovery. Implemented DiffDock — score-based diffusion with 3D-equivariant GNNs — inside the BioNeMo LLM framework. Developed GPU-optimized frameworks for ML-driven molecular dynamics, achieving 5× speed-up and 10× memory efficiency. Conceptualized and led AI-accelerated biophysical simulations for macromolecule stability and solvation free energy. Worked cross-functionally across NVIDIA Modulus (physics-informed ML), Warp (GPU simulation library), and Clara — operating directly at the simulation × AI convergence.',
    image: '/img/nbm.png',
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
    short: 'ML for therapeutic protein design with the Prescient Design group.',
    long: 'Joined Genentech\'s Prescient Design group as an ML Scientist, contributing to research on therapeutic protein design. Short, focused residency that helped sharpen the question of where AI-for-biology was — and was not — ready to drive commercial outcomes.',
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
    short: 'Invented and shipped the algorithm that now powers Aikium\'s live drug-design platform.',
    long: 'Invented a multi-objective Direct Preference Optimization (DPO) algorithm for protein and molecule language models — shipped end-to-end (research → 3 provisional patents → live production platform) in four months. The algorithm now powers Aikium\'s production drug-design platform. Published an ICLR 2024 GEM workshop paper on the method; also built a RAG pipeline for protein-design knowledge retrieval.',
    image: '/img/ElectroFluct.png',
    links: [
      { label: 'ICLR 2024 GEM paper', href: 'https://openreview.net/forum?id=qHIcWfgvIH' },
      { label: 'Aikium platform', href: 'https://www.aikium.com/' },
    ],
  },
  {
    id: 'synopsys',
    year: 2024,
    yearLabel: '2024 – 2025',
    lanes: ['chip', 'ai'],
    primaryLane: 'chip',
    title: 'Synopsys · founding engineer, GenAI Solutions',
    org: 'Synopsys',
    role: 'Senior Staff AI Engineer',
    short: 'GenAI SDK, multi-agent EDA framework, circuit foundation models. Lead patent author; Engineering Excellence award.',
    long: 'Founding engineer of the GenAI Solutions team at Synopsys. Architected and shipped an internal GenAI SDK (RAG + Agents) used across multiple business units; pioneered a novel multi-agent framework for EDA workflows. Technical lead for a cross-functional initiative building physical-design circuit foundation models — invented a circuit tokenization scheme inspired by SMILES representation of molecules. Developed an AI recommender system for EDA simulator parameter tuning, combining reinforcement learning, transformers, and hyper-graph neural networks. Lead author of Synopsys\' patent on its multi-agent EDA framework. Recipient of the Engineering Excellence Group Individual Award — selected among ~2,000 engineers — for advancing corporate-wide GenAI strategy.',
  },
  {
    id: 'voltai',
    year: 2025,
    yearLabel: '2025 – now',
    lanes: ['chip', 'hpc', 'ai'],
    primaryLane: 'chip',
    title: 'VoltAI · built Voltaire single-handedly',
    org: 'VoltAI',
    role: 'Machine Learning Researcher',
    short: 'Exascale physics-simulation platform · 32× speedup · 200M mesh elements · customer tape-out · contributed to $100M+ Series B.',
    long: 'Architected and built Voltaire — VoltAI\'s exascale physics-simulation platform — single-handedly from scratch in five months. The multi-GPU codebase I designed delivered a 32× speedup over the multi-CPU production baseline on 3D-IC signal-integrity extraction at 200M mesh elements, validated on a real TSV channel design taped out by a customer. Drove a 2× Series B raise: presented and defended Voltaire\'s architecture and exascale roadmap directly to top-tier Silicon Valley investors. Contributed to $100M+ in additional capital and a 2× lift in company valuation. Also trained EM neural operators as surrogates on top of Voltaire that learn discretization-aware solutions; built multi-turn agentic RL infrastructure and an RL-with-verifiable-rewards framework (formal verification compiler in the loop) for LLM post-training, plus an AI agent that automates parallel-simulation-software development.',
    image: '/img/1_electro_3D.png',
    links: [
      { label: 'VoltAI', href: 'https://www.voltai.com/' },
    ],
  },
];
