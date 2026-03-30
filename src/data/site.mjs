export const siteMeta = {
  title: "TANTANGENT",
  siteUrl: "https://cocoluq.github.io/",
  email: "cocoluq@gmail.com",
  stylesheet: "/main css.css",
  fontStylesheet:
    "https://fonts.googleapis.com/css?family=Dela Gothic One",
  favicon: "/assets/logo/tantangent.ico"
};

export const navigationItems = [
  {
    href: "/pages/about.html",
    className: "about",
    label: "ABOUT",
    suffix: '<span class="contact">/CONTACT</span>'
  },
  {
    href: "/pages/illustration.html",
    className: "illustration",
    label: "ILLUSTRATION",
    subtitle: [
      { href: "#books", label: "Books" },
      { href: "#personal works", label: "Personal works" }
    ]
  },
  {
    href: "/pages/other_works.html",
    className: "other-works",
    label: "OTHER WORKS"
  },
  {
    href: "/pages/playground.html",
    className: "playground",
    label: "PLAYGROUND"
  }
];

export const homePage = {
  introLines: [
    "Hello there, I'm a Bologna based illustrator/designer.",
    "Here're some of my recent works, hope you like them!"
  ],
  slideshow: [
    { src: "assets/img/firsttransation.jpg", alt: "slide 1" },
    { src: "assets/img/ocampo02.JPG", alt: "slide 2" },
    { src: "assets/img/profile-img.png", alt: "slide 3" }
  ]
};

export const aboutPage = {
  heading: ["ABOUT", "/CONTACT"],
  avatar: {
    src: "../assets/img/cr.jpg",
    alt: "Portrait of Tantangent"
  },
  about: [
    "Hello!",
    "This is Luqi Li. I often go by Tantangent as my artist name.",
    "Based in Bologna, Italy.",
    "I'm practicing in a wide field of subjects, including graphic design, print, textile art, and coding.",
    "I designed the visual interface of this site and developed it."
  ],
  contact:
    "If you have anything to ask, feel free to get in touch;)",
  socialLinks: [
    {
      href: "mailto:cocoluq@gmail.com",
      icon: "../assets/icon/email-logo.svg",
      alt: "Email"
    },
    {
      href: "https://www.instagram.com/tangent_067/",
      icon: "../assets/icon/ins-logo.svg",
      alt: "Instagram"
    },
    {
      href: "https://www.behance.net/cocoluq067/",
      icon: "../assets/icon/behance-logo.svg",
      alt: "Behance"
    }
  ]
};
