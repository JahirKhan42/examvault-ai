import { Deck } from '../types';

export const SAMPLE_NOTES_PRESETS = [
  {
    topic: 'Biology - Cellular Respiration & ATP Synthesis',
    scope: 'quick' as const,
    notes: `Lecture 4: Bioenergetics & Cellular Respiration
Key steps:
1. Glycolysis: In cytoplasm. Glucose (6C) -> 2 Pyruvate (3C). Net yield: 2 ATP (via substrate-level phos) + 2 NADH. Anaerobic, no O2 needed!
2. Link Reaction: Pyruvate moves into mito matrix. Pyruvate dehydrogenase converts it to Acetyl-CoA (2C), releases 1 CO2 & makes 1 NADH per pyruvate.
3. Krebs Cycle (Citric Acid Cycle): Matrix. Acetyl-CoA + Oxaloacetate (4C) -> Citrate (6C). Cycle turns twice per glucose. Produces: 6 NADH, 2 FADH2, 2 ATP, 4 CO2.
4. Oxidative Phosphorylation (ETC + Chemiosmosis): Inner mito membrane / cristae. High energy electrons from NADH & FADH2 pass down Complex I-IV. H+ pumped from matrix into intermembrane space -> forms electrochemical proton gradient. ATP synthase uses proton motive force (PMF) to turn ADP + Pi -> ATP.
O2 is final e- acceptor! Combines with 4H+ and 4e- to make 2 H2O.
Without O2: ETC backs up, NADH can't donate e-, entire aerobic cycle halts -> cells forced into lactic acid fermentation or alcoholic fermentation to regenerate NAD+.
Total theoretical yield: ~30-32 ATP per glucose molecule.`
  },
  {
    topic: 'Computer Science - Operating System Deadlocks',
    scope: 'quick' as const,
    notes: `CS 301 OS Deadlocks & Concurrency:
Deadlock def: State where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.
Coffman Conditions (ALL 4 must hold simultaneously for deadlock to occur):
1. Mutual Exclusion: At least 1 resource must be held in non-shareable mode (only 1 process at a time).
2. Hold and Wait: Process holding at least 1 resource is waiting to acquire additional resources held by others.
3. No Preemption: Resources cannot be forcibly taken; only released voluntarily after completion.
4. Circular Wait: P0 waits for P1, P1 waits for P2... Pn waits for P0 (closed dependency cycle in Resource Allocation Graph).
Handling strategies:
- Prevention: Invalidate at least one Coffman condition (e.g., total resource ordering eliminates circular wait).
- Avoidance: System decides dynamically if request leads to a "safe state" (e.g., Dijkstra's Banker's Algorithm - checks max claim vs allocation vs available vectors).
- Detection & Recovery: Allow deadlock to occur, run periodic cycle detection algorithms, then terminate process or abort/preempt resource.
- Ostrich Algorithm: Stick head in sand, ignore problem if it happens rarely.`
  },
  {
    topic: 'Microeconomics - Price Elasticity of Demand',
    scope: 'quick' as const,
    notes: `Econ 101: Price Elasticity of Demand (PED)
Formula: PED = % Change in Quantity Demanded / % Change in Price
- Always negative due to law of demand, but usually discussed in absolute value |PED|.
Classification:
- |PED| > 1: Elastic (demand is highly sensitive to price, luxury goods, many close substitutes).
- |PED| < 1: Inelastic (demand is insensitive, necessities, gasoline, insulin, few substitutes).
- |PED| = 1: Unit elastic (total revenue is maximized at this point).
- |PED| = 0: Perfectly inelastic (vertical demand curve).
- |PED| = infinity: Perfectly elastic (horizontal demand curve).
Total Revenue Rule:
- When demand is elastic: Price increase -> Total Revenue falls.
- When demand is inelastic: Price increase -> Total Revenue rises.
Determinants: Availability of substitutes, proportion of income, necessity vs luxury, time horizon (demand is more elastic in long run).`
  }
];

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-bio-cellular-resp',
    title: 'Biology - Cellular Respiration & ATP',
    topic: 'Biology - Cellular Respiration',
    createdAt: '2026-11-08T06:00:00.000Z',
    scope: 'quick',
    notesExcerpt: 'Glycolysis, Krebs cycle, ETC, ATP synthase chemiosmosis, and anaerobic fermentation.',
    cards: [
      {
        id: 1,
        type: 'definition',
        front: 'Chemiosmosis',
        back: 'The process where energy stored in an electrochemical proton gradient across the inner mitochondrial membrane is used by ATP synthase to phosphorylate ADP into ATP.',
        extraContext: 'Clarified the role of ATP synthase and proton motive force (PMF) across cristae.',
        status: 'mastered'
      },
      {
        id: 2,
        type: 'concept',
        front: 'What is the role of Oxygen (O2) in oxidative phosphorylation, and what occurs if it is absent?',
        back: 'Oxygen serves as the terminal electron acceptor at Complex IV, combining with electrons and protons to form water. Without O2, the electron transport chain backs up, NADH cannot be reoxidized to NAD+, and aerobic ATP production halts, forcing cells into fermentation.',
        extraContext: 'Synthesized mechanism steps from notes into an exam-style causality explanation.',
        status: 'unstudied'
      },
      {
        id: 3,
        type: 'definition',
        front: 'Substrate-Level Phosphorylation',
        back: 'Direct synthesis of ATP from ADP by the transfer of a phosphate group from a high-energy phosphorylated substrate, occurring during Glycolysis and the Citric Acid Cycle.',
        extraContext: null,
        status: 'review'
      },
      {
        id: 4,
        type: 'concept',
        front: 'Why must the Citric Acid (Krebs) Cycle turn twice for every single molecule of glucose oxidized?',
        back: 'Because 6-carbon glucose is cleaved during glycolysis into two 3-carbon pyruvate molecules, resulting in two Acetyl-CoA molecules entering the cycle per glucose molecule.',
        extraContext: null,
        status: 'mastered'
      },
      {
        id: 5,
        type: 'definition',
        front: 'Proton Motive Force (PMF)',
        back: 'The electrochemical potential gradient generated by electron transport complexes pumping H+ protons from the mitochondrial matrix into the intermembrane space.',
        extraContext: "Expanded note abbreviation 'PMF' to full biochemical definition.",
        status: 'unstudied'
      },
      {
        id: 6,
        type: 'concept',
        front: 'Compare the net ATP and electron carrier output of Glycolysis versus the Krebs Cycle per glucose molecule.',
        back: 'Glycolysis yields a net of 2 ATP and 2 NADH in the cytoplasm. The Krebs Cycle yields 2 ATP, 6 NADH, and 2 FADH2 in the mitochondrial matrix (from both turns).',
        extraContext: null,
        status: 'unstudied'
      },
      {
        id: 7,
        type: 'definition',
        front: 'Lactic Acid Fermentation',
        back: 'An anaerobic metabolic pathway that reduces pyruvate to lactate using electrons from NADH, thereby regenerating NAD+ so glycolysis can continue generating 2 ATP.',
        extraContext: 'Detailed the evolutionary purpose of NAD+ regeneration noted in shorthand.',
        status: 'review'
      },
      {
        id: 8,
        type: 'concept',
        front: 'Where in the cell do the four main stages of cellular respiration take place?',
        back: '1. Glycolysis: Cytoplasm; 2. Link Reaction: Mitochondrial matrix; 3. Krebs Cycle: Mitochondrial matrix; 4. Oxidative Phosphorylation: Inner mitochondrial membrane (cristae).',
        extraContext: null,
        status: 'mastered'
      }
    ]
  },
  {
    id: 'deck-cs-deadlocks',
    title: 'Operating Systems - Deadlocks & Concurrency',
    topic: 'Computer Science - Deadlocks',
    createdAt: '2026-11-08T05:30:00.000Z',
    scope: 'quick',
    notesExcerpt: 'Coffman conditions, Bankers algorithm, deadlock prevention, detection and recovery.',
    cards: [
      {
        id: 1,
        type: 'definition',
        front: 'Deadlock',
        back: 'A permanent blocking state in concurrent programming where a set of processes are halted because each process is holding a resource and waiting for another resource held by another process.',
        extraContext: null,
        status: 'mastered'
      },
      {
        id: 2,
        type: 'concept',
        front: 'Name and describe the four Coffman Conditions that must simultaneously hold for a deadlock to occur.',
        back: '1. Mutual Exclusion (non-shareable resources)\n2. Hold and Wait (process holds resource while requesting others)\n3. No Preemption (resources cannot be forcibly confiscated)\n4. Circular Wait (a closed loop chain of waiting processes).',
        extraContext: 'Summarized the four conditions into distinct test-ready bullet points.',
        status: 'mastered'
      },
      {
        id: 3,
        type: 'definition',
        front: "Banker's Algorithm",
        back: "A deadlock avoidance algorithm developed by Dijkstra that tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources before approving a request.",
        extraContext: 'Expanded note shorthand attributing the algorithm to Edsger Dijkstra.',
        status: 'unstudied'
      },
      {
        id: 4,
        type: 'concept',
        front: 'How can an operating system break the "Circular Wait" condition to prevent deadlocks?',
        back: 'By establishing a strict global numerical ordering on all resources (e.g., R1 < R2 < R3) and requiring processes to request resources only in strictly increasing order.',
        extraContext: 'Explained the total resource ordering implementation technique.',
        status: 'review'
      },
      {
        id: 5,
        type: 'definition',
        front: 'Resource Allocation Graph (RAG)',
        back: 'A directed graph where vertices represent processes and resources, and directed edges indicate either resource allocation (Resource -> Process) or resource request (Process -> Resource).',
        extraContext: null,
        status: 'unstudied'
      },
      {
        id: 6,
        type: 'concept',
        front: 'What is the distinction between Deadlock Prevention and Deadlock Avoidance?',
        back: 'Prevention eliminates the possibility of deadlock statically by invalidating at least one Coffman condition. Avoidance allows all conditions but makes dynamic runtime safety checks (like Banker\'s Algorithm) before allocating.',
        extraContext: 'Clarified static structural constraint vs runtime dynamic decision difference.',
        status: 'unstudied'
      }
    ]
  }
];
