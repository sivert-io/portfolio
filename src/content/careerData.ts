import type { CareerTimelineItem } from '../components/CareerTimeline'

export const careerItems: CareerTimelineItem[] = [
  {
    year: '2025',
    title: "Completed Master's degree in Interaction Design",
    subtitle: 'Norwegian University of Science and Technology (NTNU)',
    logo: '/logos/ntnu.svg',
    duration: '2023 – 2025',
    badge: 'Grade: A',
    categories: ['education'],
    description:
      'Completed a Master’s degree in Interaction Design with a focus on human-centred design, usability engineering, research-driven UX practice, and sustainable digital systems.',
    tooltip: {
      title: "Master's degree, Interaction Design",
      body: 'The programme focused on advanced interaction design, usability engineering, interface design, information architecture, UX evaluation, academic research, and scientific communication.',
      footer: 'NTNU · Gjøvik',
    },
  },
  {
    year: '2023',
    title: 'Graduated with a BSc in Web Development',
    subtitle: 'Norwegian University of Science and Technology (NTNU)',
    logo: '/logos/ntnu.svg',
    duration: '2020 – 2023',
    badge: 'Grade: A',
    categories: ['education'],
    description:
      'Completed a Bachelor’s degree in Web Development with a strong focus on user-centred, accessible, and sustainable web solutions.',
    tooltip: {
      title: "Bachelor's degree, Web Development",
      body: 'The degree covered frontend and backend web development, accessibility, usability testing, prototyping, design systems, agile methods, sustainable web development, and applied research.',
      footer: 'NTNU · Eureka Prize for Best Bachelor Thesis 2023',
    },
  },
  {
    year: '2023',
    title: 'Won the Eureka Prize for Best Bachelor Thesis',
    subtitle: 'NTNU Gjøvik',
    logo: '/logos/ntnu.svg',
    duration: 'September 2023',
    badge: 'Award',
    categories: ['education', 'research'],
    description:
      'My bachelor thesis work on sustainable web design was recognized with the Eureka Prize for best bachelor project of the year.',
    tooltip: {
      title: 'Eureka Prize',
      body: 'The Eureka Prize recognizes outstanding bachelor theses based on scientific quality, practical relevance, innovation, and research significance.',
      footer: 'Best Bachelor Thesis 2023',
    },
  },
  {
    year: '2023',
    title: 'Published research in sustainable web design',
    subtitle: 'HCII, Mensch und Computer, and NTNU',
    logo: '/logos/springer.svg',
    duration: '2023',
    badge: '3 publications',
    categories: ['research', 'education'],
    description:
      'Contributed to multiple research publications on sustainable web design, including developer awareness, practical barriers, and applied guidelines.',
    tooltip: {
      title: 'Research publications',
      body: 'The work was published across venues including the International Conference on Human-Computer Interaction, Proceedings of Mensch und Computer 2023, and NTNU-affiliated guideline work.',
      footer: 'See the publications list below for full details.',
    },
  },
  {
    year: '2022',
    title: 'Started working at Norsk Tipping',
    subtitle: 'Programvareingeniør / Frontend Software Engineer',
    logo: '/logos/norsk-tipping.svg',
    duration: 'Oct 2022 – Present',
    badge: 'Casino & Poker',
    categories: ['work'],
    description:
      'Frontend-focused software engineer working on large-scale regulated gaming platforms, with a primary focus on React, TypeScript, Tailwind, Redux, animation libraries, and product-facing user experiences.',
    tooltip: {
      title: 'Norsk Tipping',
      body: 'Currently working in the Casino & Poker domain. Started in XGAMES and later transitioned into Casino & Poker. Work includes large-scale frontend experiences, provider integrations, in-game payment flows, notifications, user settings, and close collaboration with design, backend, product, legal, marketing, data, and operations.',
      footer: 'Hamar, Innlandet, Norway · Hybrid',
    },
  },
  {
    year: '2021',
    title: 'Worked as Junior Developer at Novicell Norge',
    subtitle: 'Part-time',
    logo: '/logos/novicell.svg',
    duration: 'Aug 2021 – Oct 2022',
    badge: 'Consulting',
    categories: ['work'],
    description:
      'Worked with backend development, CMS development in Umbraco, frontend implementation, and integration between backend services and UI.',
    tooltip: {
      title: 'Novicell Norge',
      body: 'The work included .NET Core applications and services, CMS customization in Umbraco with C#, frontend component work, styling, and close collaboration using tools such as JIRA, Confluence, and Bitbucket in Scrum-based projects.',
      footer: 'Oslo, Norway',
    },
  },
  {
    year: '2020',
    title: 'Student representative and quality assurance work at NTNU',
    subtitle: 'Student Representative and Quality Assurance Manager',
    logo: '/logos/ntnu.svg',
    duration: 'Aug 2020 – Nov 2025',
    badge: 'Volunteer',
    categories: ['education'],
    description:
      'Represented student interests, gathered feedback, and contributed to quality assurance and dialogue between students, courses, and the institution.',
    tooltip: {
      title: 'Student representation',
      body: 'Worked across both bachelor and master years as class representative and quality assurance contributor, helping communicate student feedback on learning environment, teaching plans, course execution, and overall study quality.',
      footer: 'NTNU',
    },
  },
  {
    year: '2020',
    title: 'Front-end Lead at Start Gjøvik',
    subtitle: 'Volunteer role',
    icon: 'volunteering',
    duration: 'Oct 2020 – Nov 2021',
    badge: 'Community',
    categories: ['freelance'],
    description:
      'Worked on frontend development for Start Gjøvik’s website and collaborated with the IT lead on the broader web solution.',
    tooltip: {
      title: 'Start Gjøvik',
      body: 'Focused on frontend development and implementation of the organization’s official website, working closely with the backend counterpart and helping shape the digital presence of the student initiative.',
      footer: 'Volunteer role',
    },
  },
  {
    year: '2020',
    title: 'Led Makerspace NTNU Gjøvik',
    subtitle: 'Leader',
    logo: '/logos/ntnu.svg',
    duration: 'Aug 2020 – Apr 2021',
    badge: 'Leadership',
    categories: ['education', 'freelance'],
    description:
      'Led the student organization and helped create space for experimentation, making, and practical learning for students.',
    tooltip: {
      title: 'Makerspace NTNU Gjøvik',
      body: 'The organization aimed to make hands-on making, building, and exploration more accessible to students. The leadership role ended when studies required more focus and time.',
      footer: 'Volunteer leadership',
    },
  },
  {
    year: '2017',
    title: "Worked at Kitch'n",
    subtitle: 'Sales Employee',
    logo: '/logos/kitchn.svg',
    duration: 'Aug 2017 – Jan 2022',
    badge: 'Retail',
    categories: ['work'],
    description:
      'Built strong experience in customer service, communication, and understanding people’s needs through real-world retail work.',
    tooltip: {
      title: "Kitch'n",
      body: 'This role became an important part of learning how to understand user needs, communicate clearly, and guide people toward good decisions — skills that later transferred naturally into product and UX-oriented engineering work.',
      footer: 'Gjøvik and Raufoss, Norway',
    },
  },
  {
    year: '2016',
    title: 'Started long-term indie game development',
    subtitle: 'Self-employed / hobby development',
    icon: 'star',
    duration: 'Feb 2016 – Present',
    badge: 'Creative practice',
    categories: ['freelance'],
    description:
      'Built long-term experience across Unity, Unreal, and Godot through side projects, experimentation, game systems, tooling, and creative prototyping.',
    tooltip: {
      title: 'Indie game development',
      body: 'This work involved engines such as Unity, Unreal Engine 4/5, and Godot, with experience across gameplay systems, networking, shaders, scene composition, Blender workflows, UI design, planning, and documentation.',
      footer: 'Long-running side practice',
    },
  },
  {
    year: '2016',
    title: 'Worked with back-end development',
    subtitle: 'Self-employed',
    icon: 'work',
    duration: 'May 2016 – Sep 2017',
    badge: 'Backend',
    categories: ['freelance'],
    description:
      'Expanded from frontend into backend development, APIs, and databases through self-driven experimentation and practical project work.',
    tooltip: {
      title: 'Back-end development',
      body: 'Worked with PHP, SQL, JavaScript, C#, and Node.js while learning to build APIs, connect external services, and support more complete web applications.',
      footer: 'Self-driven learning',
    },
  },
  {
    year: '2015',
    title: 'Started building for the web',
    subtitle: 'Self-directed learning and early web development',
    icon: 'work',
    duration: 'Oct 2015 – Jun 2017',
    badge: 'Frontend',
    categories: ['freelance'],
    description:
      'Began learning frontend and later backend development through self-driven experimentation, eventually growing into a long-term path in software engineering.',
    tooltip: {
      title: 'Early web development',
      body: 'Started with frontend fundamentals and quickly expanded into backend work, programming concepts, APIs, and databases. This became the starting point for both formal education and professional development later on.',
      footer: 'The beginning of the developer journey',
    },
  },
  {
    year: '2014',
    title: 'Studied science-focused general education',
    subtitle: 'Gjøvik Videregående Skole',
    icon: 'education',
    duration: '2014 – 2017',
    badge: 'Science track',
    categories: ['education'],
    description:
      'Studied general university-preparatory education with emphasis on science, mathematics, IT, physics, and English.',
    tooltip: {
      title: 'Gjøvik Videregående Skole',
      body: 'Included subjects such as Math T1, R1, R2, Physics 1, IT-1, IT-2, International English, Earth Science, and German. This period helped shape a strong interest in technology and computer science.',
      footer: 'Studiespesialisering · Scientific direction',
    },
  },
]
