
 export async function streamCsv(url, options, callback) {
  const defaults = {
    hasHeaders: true, //return raw data if false
    skipBlanks: true, //skip lines with no data
    debug: false, //display debug messages if true
    preview: 0, //retun all records if 0 else return n records
  };
  const { hasHeaders, skipBlanks, debug, preview } = {
    ...defaults,
    ...options,
  };
  const previewCount = isNaN(preview)
    ? Infinity
    : preview === 0
    ? Infinity
    : preview;
  let count = 0;
  try {
    function parse(raw) {
      if (!hasHeaders) return raw;
      const data = {};
      for (let i = 0; i < header.length; i++) {
        data[header[i]] = raw[i] ? raw[i] : "";
      }
      return data;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch CSV file: ${response.status} - ${response.statusText}`
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8"); // Assuming UTF-8 encoding
    let remainingData = "";
    let header = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Process any remaining data after the last chunk
        if (remainingData.trim()) {
          if (count >= previewCount) {
            callback({ action: "end", count });
            break;
          }
          const lastLineValues = remainingData.split(",").map((v) => v.trim());
          count++;
          callback({ action: "step", data: parse(lastLineValues), count });
        }
        callback({ action: "end", count });
        break; // Exit the loop when the stream is finished
      }

      const chunk = decoder.decode(value, { stream: true });
      // console.log(removeUnprintable(chunk))
      const data = remainingData + chunk;
      const lines = data.split("\n");
      remainingData = lines.pop() || ""; // Keep the last potentially incomplete line

      if (!header) {
        header =
          hasHeaders && lines.length > 0
            ? lines
                .shift()
                .split(",")
                .map((h, i) => {
                  const hTrim = h.trim();
                  return hTrim === "" ? `Column ${i}` : hTrim;
                })
            : "no-header";
      }

      if (header) {
        for (const line of lines) {
          const values = line.split(",").map((v) => v.trim());
          if (count >= previewCount) break;
          count++;
          callback({ action: "step", data: parse(values), count });
        }
        if (count >= previewCount) {
          callback({ action: "end", count });
          break;
        }
      }
    }
    return count;
  } catch (error) {
    callback({ action: "error", error, count });
  }
  function removeUnprintable(str) {
    return str.replace(/[^a-zA-Z0-9]/g, " ");
    return str.replace(
      /[\x00-\x1F\x7F-\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/g,
      ""
    );
  }
}

// async function readTextFile(url, callback) {
//   try {
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.text();
//     callback({ data });
//   } catch (error) {
//     callback({ error });
//   }
// }
