import { NodeType, parse } from "node-html-parser";

const COLORS = {
  Notice: "#00FF00",
  Report: "#89A0FA",
  Incident: "#FEFF45",
  Accident: "#E58326",
  Crash: "#E52F18",
};

function formatLocationAndDate(locationExists, location, date) {
  let str = (locationExists ? location : '') + date;
  str = str.trim();
  str = str[0].toUpperCase() + str.slice(1);
  return str;
}

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

  let color: string;

  if (title.includes(":")) {
    color = COLORS[title.split(":")[0]];

    // Strip incident type out of the title as it's already indicated by the color
    title = title.split(":")[1].trim();
  } else {
    // If there's no accident type in the title, assume it's a notice
    color = COLORS["Notice"];
  }

  let contentText = content!.childNodes
    .map((node, i) => {
      if (node.nodeType === NodeType.TEXT_NODE) {
        if (i === 0) {
          // extract the location, which means the stuff between "was" and "when" (or when sentence ends and a new one begins), and what happened ("happenings"), which begins after "when" (or the next sentence).
          const nodeTextContent = node.text;
          const locationStartIndex = nodeTextContent.indexOf(', was ');

          const whenIndex = nodeTextContent.indexOf(' when ');
          
          // index of the first occurence of a sentence ending in a full-stop and the next beginning with a capital letter
          const firstSentenceBoundaryIndex = Math.min(
            ...nodeTextContent.split('.').map((sentence, i, arr) => {
              if (sentence.length === 0) return Infinity; // empty sentence ... wouldnt want to select one of those

              // the index of the next sentence is the sum of the lengths of all previous sentences + fullstops
              const nextIndex = arr.slice(0, i + 1).map(sentence => sentence.length + 1).reduce((partialSum, currentValue) => partialSum + currentValue, 0);

              const nextsentence = arr[i + 1];
              
              // if this is the last sentence, return index of this sentence's fullstop
              if (i === arr.length - 1) {
                return nextIndex - 1;
              }

              // if this isnt the last sentence and the next one begins with a space and capital letter, return index of this sentence's fullstop
              if (i < arr.length - 1 && nextsentence[0] === ' ' && nextsentence[1] === nextsentence[1].toUpperCase()) return nextIndex - 1;
              
              // fallback (does this ever happen?)
              return Infinity;
            })
          );
          
          // based on where "when" and the first sentence boundary are, calculate where the location part ends and "happenings" starts
          let happeningsStartIndex_locationExists;
          const locationEndIndex = (() => {
            if (whenIndex === -1 || firstSentenceBoundaryIndex < whenIndex) {
              // we go with sentence
              happeningsStartIndex_locationExists = firstSentenceBoundaryIndex + 2;
              return firstSentenceBoundaryIndex;
            } else {
              // we go with "when"
              happeningsStartIndex_locationExists = whenIndex + 6;
              return whenIndex;
            }
          })();
          
          let locationExists;
          let location;
          let happenings;
          // if somehow the location is supposed to start before it ends, or if it has no start, then there is no location
          if (locationStartIndex >= locationEndIndex || locationStartIndex === -1) {
            // location doesnt exist
            locationExists = false;
            // so "happenings" starts with keyword, not "when"
            const happeningsKeywords = ['stated', 'landed', 'departed', 'performed'];
            const happeningsStartIndex_noLocation = Math.min( // whichever is first in the text
              ...happeningsKeywords
                .map(word => nodeTextContent.indexOf(' ' + word + ' ')) // map by index of first occurence
                .filter(i => i >= 0) // discard situationkeywords that dont exist in the text, because Math.min() prefers them (-1)
            ) + 1;
            happenings = nodeTextContent.slice(happeningsStartIndex_noLocation);
            happenings = happenings[0].toUpperCase() + happenings.slice(1);
          } else {
            // location exists
            location = nodeTextContent.slice(locationStartIndex + 6, locationEndIndex);
            location = location[0].toUpperCase() + location.slice(1);
            locationExists = true;
            // happenings is after location
            happenings = nodeTextContent.slice(happeningsStartIndex_locationExists);
            happenings = happenings[0].toUpperCase() + happenings.slice(1);
          }

          if (!happenings || happenings === '' || happenings === 'undefined' /* does this ever happen? */) happenings = nodeTextContent;

          return `📌 ${formatLocationAndDate(locationExists, location, date)}\n\n${happenings}`;
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
