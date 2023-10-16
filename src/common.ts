import { NodeType, parse } from "node-html-parser";

const colors = {
  Report: "#89a0fa",
  Incident: "#feff45",
  Accident: "#e58326",
  Crash: "#e52f18",
};

export async function generateHTML(articleId: string) {
  const url = `https://avherald.com/h?article=${articleId}`;

  const html = await fetch(url, {
    headers: {
      'User-Agent': 'EmbedHerald Scraper'
    }
  }).then((res) => res.text());

  const parsed = parse(html);

  const potentialTitles = parsed.querySelectorAll(".headline_article");
  let title = potentialTitles[potentialTitles.length - 1].innerText;
  const content = parsed.querySelector("td > div > .sitetext");
  const images = content!.querySelectorAll("img");

  const color = colors[title.split(":")[0]];

  // Strip incident type out of the title, it's already indicated by the color
  title = title.split(":")[1].trim();

  let contentText = content!.childNodes
    .map((node) => {
      if (node.nodeType === NodeType.TEXT_NODE) {
        return node.text;
      } else {
        if (node.nodeType == NodeType.ELEMENT_NODE && (node as unknown as Element).tagName === "BR") {
          return "\n";
        }
      }

      return "";
    })
    .join("");

  // Trim content to 400 characters
  contentText = contentText.slice(0, 400);

  return `
    <head>
      <meta http-equiv="refresh" content="0;URL='${url}'"/>
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${contentText}" />
      <meta property="og:url" content="${url}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="The Aviation Herald" />
      ${
        images
          .map((image) => {
            return `<meta property="og:image" content="${
              image.attributes.src
            }" />
            ${
              image.attributes.width
                ? `<meta property="og:image:width" content="${image.attributes.width}" />`
                : ""
            }
            ${
              image.attributes.height
                ? `<meta property="og:image:height" content="${image.attributes.height}" />`
                : ""
            }`;
          })
          .join("") || ""
      }
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="theme-color" content="${color}" />
    </head>
  `;
}
