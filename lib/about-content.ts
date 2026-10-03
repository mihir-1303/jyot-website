export type AboutImage = { src: string; alt: string };
export type Testimonial = { image: AboutImage; name: string; designation: string; quote: string };

export const aboutContent = {
  eyebrow: "ABOUT",
  title: "About Jyot",
  statement: "Igniting the light of knowledge within every soul",
  quote: "Jyot is a perfect blend of scientific temperament & religious knowledge system for all age groups, beliefs & levels of intellect.",
  introduction: "At Jyot, we strive to provide the best of knowledge to help one's inner vision grow and to guide one's internal journey in the right direction. Jyot is a magnanimous effort to create a spiritual revolution within the next generation, shaping them into responsible human beings.",
  fundamentals: [
    { src: "/about/fundamental-universal-truth.gif", alt: "Universal Truth" },
    { src: "/about/fundamental-justice.svg", alt: "Justice" },
    { src: "/about/fundamental-right-to-live.gif", alt: "Right to Live" },
  ] satisfies AboutImage[],
  established: {
    year: "2009",
    label: "Established In",
    paragraphs: [
      "Established in 2009 by a perfect blend of youngsters & experienced, Jyot's aim is to spread nectar of knowledge, to help an individual enrich his thoughts, on the way of him becoming a responsible human being.",
      "Jyot is carried forward under able management team with leadership that has successfully organized events touching everyone from layman to top dignitaries including Prime Minister Narendra Modi, Gautam Adani, and Shri Morarji Bapu.",
    ],
  },
  vision: {
    title: "Vision",
    image: { src: "/about/vision.png", alt: "An eye representing vision" } satisfies AboutImage,
    text: "At Jyot, we believe that to change a person's life, it is of paramount importance that the way he thinks is changed. The path to know the true knowledge starts with the quest & curiosity to know & accept it.",
  },
  mission: {
    title: "Mission",
    image: { src: "/about/mission.png", alt: "A visual representation of Jyot's mission" } satisfies AboutImage,
    text: "Our mission is to spread this invaluable knowledge, Heritage and Culture benefiting the future generations helping them to become responsible citizens who can themselves find the Right Path.",
  },
  testimonials: [
    { image: { src: "/about/narendra-modi.jpg", alt: "Narendra Modi" }, name: "Narendra Modi", designation: "Prime Minister, India", quote: "I appreciate Team JYOT & Pandit Maharaja, for connecting our faith and traditions with knowledge stream which enlightens the true journey of life." },
    { image: { src: "/about/manish-mokshagundam.jpg", alt: "Dr. Manish Mokshagundam" }, name: "Dr. Manish Mokshagundam", designation: "Lead Faculty – NDTV", quote: "Such an educational and value based movie should be screened across various educational institutions." },
    { image: { src: "/about/chandrashekar.jpg", alt: "T. Chandrashekar" }, name: "T. Chandrashekar", designation: "Principal, Oxford B.Ed. College", quote: "This movie will ignite your thinking to know yourself and then the evolution will begin." },
    { image: { src: "/about/chenraj-jain.jpg", alt: "Dr. Chenraj Jain" }, name: "Dr. Chenraj Jain", designation: "Chairman, JGI", quote: "It's the universal happiness within that you really need to experience. This movie will appeal youngsters to a great extent." },
    { image: { src: "/about/nirmal-surana.jpg", alt: "Nirmal Surana" }, name: "Nirmal Surana", designation: "Karnataka State Secretary – BJP", quote: "Working with team JYOT has taken my confidence to the next level." },
    { image: { src: "/about/rajesh-khatri.jpg", alt: "Rajesh Khatri" }, name: "Rajesh Khatri", designation: "Actor", quote: "For me 'Ek Cheez...' has been a beautiful Experience, Soul Stirring, Mind Boggling, Heart Touching. Overall Brilliant." },
    { image: { src: "/about/rahul-kapoor-jain.jpg", alt: "Rahul Kapoor Jain" }, name: "Rahul Kapoor Jain", designation: "Entrepreneur, Speaker and Author", quote: "ECMW is a unique initiative to scientifically and logically explain the concept of true, complete and never ending happiness in a form of a movie." },
    { image: { src: "/about/nimesh-kampani.jpg", alt: "Nimesh Kampani" }, name: "Nimesh Kampani", designation: "Chairman, JM Financial Ltd.", quote: "Even an atheist with open mind will start believing in existence of the soul after watching this movie." },
    { image: { src: "/about/sheetal-shah.jpg", alt: "Sheetal Shah" }, name: "Sheetal Shah", designation: "Mrs. Gujrati, Bangalore", quote: "It's a real good eye opener for everyone. The message should spread across the globe." },
    { image: { src: "/about/gautam-shah.jpg", alt: "Gautam Shah" }, name: "Gautam Shah", designation: "Film Distributor", quote: "Hats off to the man, whose brain has gone into conceptualising this movie. This movie deserves an Oscar." },
  ] satisfies Testimonial[],
};
