/**
 * Legal-page content, extracted verbatim from the reference site
 * (Wix-style template text — parity content, not legal advice).
 */

export interface LegalSection {
  h2: string | null;
  paras: string[];
  /** Optional reference list rendered after the paragraphs (accessibility
   *  page parity): "disc" → list-disc list-inside mt-4 space-y-2,
   *  "none" → list-none mt-4 space-y-1 (the reference's exact classes). */
  list?: {
    style: "disc" | "none";
    items: string[];
  };
}

export interface LegalPage {
  title: string;
  /** Rendered under the H1 — null omits the caption (accessibility parity:
   *  the reference shows it on privacy/terms/refund-policy but not there). */
  disclaimer: string | null;
  sections: LegalSection[];
}

export const PRIVACY: LegalPage = {
  title: "Privacy Policy",
  disclaimer: "A legal disclaimer",
  sections: [
    {
      h2: null,
      paras: [
        "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of a Privacy Policy. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific privacy policies you wish to establish between your business and your customers and visitors. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Privacy Policy.",
      ],
    },
    {
      h2: "Privacy Policy - the basics",
      paras: [
        "Having said that, a privacy policy is a statement that discloses some or all of the ways a website collects, uses, discloses, processes, and manages the data of its visitors and customers. It usually also includes a statement regarding the website's commitment to protecting its visitors' or customers' privacy, and an explanation about the different mechanisms the website is implementing in order to protect privacy.",
        "Different jurisdictions have different legal obligations of what must be included in a Privacy Policy. You are responsible to make sure you are following the relevant legislation to your activities and location.",
      ],
    },
    {
      h2: "What to include in the Privacy Policy",
      paras: [
        "Generally speaking, a Privacy Policy often addresses these types of issues: the types of information the website is collecting and the manner in which it collects the data; an explanation about why is the website collecting these types of information; what are the website's practices on sharing the information with third parties; ways in which your visitors and customers can exercise their rights according to the relevant privacy legislation; the specific practices regarding minors' data collection; and much, much more.",
      ],
    },
  ],
};

export const TERMS: LegalPage = {
  title: "Terms & Conditions",
  disclaimer: "A legal disclaimer",
  sections: [
    {
      h2: null,
      paras: [
        "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of Terms & Conditions. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific terms you wish to establish between your business and your customers and visitors. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Terms & Conditions.",
      ],
    },
    {
      h2: "Terms & Conditions - the basics",
      paras: [
        "Having said that, Terms and Conditions (\"T&C\") are a set of legally binding terms defined by you, as the owner of this website. The T&C set forth the legal boundaries governing the activities of the website visitors, or your customers, while they visit or engage with this website. The T&C are meant to establish the legal relationship between the site visitors and you as the website owner.",
        "T&C should be defined according to the specific needs and nature of each website. For example, a website offering products to customers in e-commerce transactions requires T&C that are different from the T&C of a website only providing information (like a blog, a landing page, and so on).",
        "T&C provide you as the website owner the ability to protect yourself from potential legal exposure, but this may differ from jurisdiction to jurisdiction, so make sure to receive local legal advice if you are trying to protect yourself from legal exposure.",
      ],
    },
    {
      h2: "What to include in the T&C document",
      paras: [
        "Generally speaking, T&C often address these types of issues: Who is allowed to use the website; the possible payment methods; a declaration that the website owner may change his or her offering in the future; the types of warranties the website owner gives his or her customers; a reference to issues of intellectual property or copyrights, where relevant; the website owner's right to suspend or cancel a member's account; and much, much more.",
      ],
    },
  ],
};

export const ACCESSIBILITY: LegalPage = {
  title: "Accessibility Statement",
  disclaimer: null,
  sections: [
    {
      h2: null,
      paras: [
        "The purpose of the following template is to assist you in writing your accessibility statement. Please note that you are responsible for ensuring that your site's statement meets the requirements of the local law in your area or region.",
        "*Note: This page currently has several sections. Once you complete editing the Accessibility Statement below, you need to delete this section.",
        "To learn more about this, check out our article \"Accessibility: Adding an Accessibility Statement to Your Site\".",
      ],
    },
    {
      h2: "Accessibility Statement",
      paras: [
        "This statement was last updated on [enter relevant date].",
        "We at [enter organization / business name] are working to make our site [enter site name and address] accessible to people with disabilities.",
      ],
    },
    {
      h2: "What Web Accessibility Is",
      paras: [
        "An accessible site allows visitors with disabilities to browse the site with the same or a similar level of ease and enjoyment as other visitors. This can be achieved with the capabilities of the system on which the site is operating, and through assistive technologies.",
      ],
    },
    {
      h2: "Accessibility Adjustments on This Site",
      paras: [
        "We have adapted this site in accordance with WCAG [2.0 / 2.1 / 2.2 - select relevant option] guidelines, and have made the site accessible to the level of [A / AA / AAA - select relevant option]. This site's contents have been adapted to work with assistive technologies, such as screen readers and keyboard use. As part of this effort, we have also [remove irrelevant information]:",
      ],
      list: {
        style: "disc",
        items: [
          "Used the Accessibility Wizard to find and fix potential accessibility issues",
          "Set the language of the site",
          "Set the content order of the site's pages",
          "Defined clear heading structures on all of the site's pages",
          "Added alternative text to images",
          "Implemented color combinations that meet the required color contrast",
          "Reduced the use of motion on the site",
          "Ensured all videos, audio, and files on the site are accessible",
        ],
      },
    },
    {
      h2: "Declaration of Partial Compliance With the Standard Due to Third-Party Content [only add if relevant]",
      paras: [
        "The accessibility of certain pages on the site depend on contents that do not belong to the organization, and instead belong to [enter relevant third-party name]. The following pages are affected by this: [list the URLs of the pages]. We therefore declare partial compliance with the standard for these pages.",
      ],
    },
    {
      h2: "Accessibility Arrangements in the Organization [only add if relevant]",
      paras: [
        "[Enter a description of the accessibility arrangements in the physical offices / branches of your site's organization or business. The description can include all current accessibility arrangements - starting from the beginning of the service (e.g., the parking lot and / or public transportation stations) to the end (such as the service desk, restaurant table, classroom etc.). It is also required to specify any additional accessibility arrangements, such as disabled services and their location, and accessibility accessories (e.g. in audio inductions and elevators) available for use]",
      ],
    },
    {
      h2: "Requests, Issues, and Suggestions",
      paras: [
        "If you find an accessibility issue on the site, or if you require further assistance, you are welcome to contact us through the organization's accessibility coordinator:",
      ],
      list: {
        style: "none",
        items: [
          "[Name of the accessibility coordinator]",
          "[Telephone number of the accessibility coordinator]",
          "[Email address of the accessibility coordinator]",
          "[Enter any additional contact details if relevant / available]",
        ],
      },
    },
  ],
};

export const REFUND_POLICY: LegalPage = {
  title: "Refund Policy",
  disclaimer: "A legal disclaimer",
  sections: [
    {
      h2: null,
      paras: [
        "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of a Refund Policy. You should not rely on this article as legal advice or as recommendations regarding what you should actually do, because we cannot know in advance what are the specific refund policies that you wish to establish between your business and your customers. We recommend that you seek legal advice to help you understand and to assist you in the creation of your own Refund Policy.",
      ],
    },
    {
      h2: "Refund Policy - the basics",
      paras: [
        "Having said that, a Refund Policy is a legally binding document that is meant to establish the legal relations between you and your customers regarding how and if you will provide them with a refund. Online businesses selling products are sometimes required (depending on local laws and regulations) to present their product return policy and refund policy. In some jurisdictions, this is needed in order to comply with consumer protection laws. It may also help you avoid legal claims from customers that are not satisfied with the products they purchased.",
      ],
    },
    {
      h2: "What to include in the Refund Policy",
      paras: [
        "Generally speaking, a Refund Policy often addresses these types of issues: the timeframe for asking for a refund; will the refund be full or partial; under which conditions will the customer receive a refund; and much much more.",
      ],
    },
  ],
};
