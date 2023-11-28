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

  // take the date out of the title
  const onIndex = title.indexOf(' on ');
  const commaIndex = title.indexOf(', ');
  let date = '';
  if (commaIndex > onIndex && onIndex > 0) {
    date = title.substring(onIndex, commaIndex);
    title = title.substring(0, onIndex) + title.substring(commaIndex);
  }

  const content = parsed.querySelector("td > div > .sitetext");
  const images = content!.querySelectorAll("img");

  const color = colors[title.split(":")[0]];

  // Strip incident type out of the title, it's already indicated by the color
  title = title.split(":")[1].trim();

  let contentText = content!.childNodes
    .map((node, i) => {
      if (node.nodeType === NodeType.TEXT_NODE) {
        if (i === 0) {
          // extract the location, which means the stuff between "was" and "when", and what happened, which begins after "when".
          const nodeTextContent = node.text;
          const wasIndex = nodeTextContent.indexOf(' was ');
          const whenIndex = nodeTextContent.indexOf(' when ');

          // if things go unexpectedly, abort
          if (wasIndex >= whenIndex || wasIndex < 0) return node.text;

          let location = nodeTextContent.substring(wasIndex + 5, whenIndex);
          location = location[0].toUpperCase() + location.slice(1);
          let happenings = nodeTextContent.substring(whenIndex + 6);
          happenings = happenings[0].toUpperCase() + happenings.slice(1);

          return `📌 ${location + date}\n\n${happenings}`;
        } else return node.text;
      } else {
        if (node.nodeType == NodeType.ELEMENT_NODE && (node as unknown as Element).tagName === "BR") {
          return "\n";
        }
      }

      return "";
    })
    .join("");

  // Trim content to 400 characters
  contentText = contentText.slice(0, 400).trim() + '...';

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
