const CMD = "code --list-extensions --show-versions";
const MARKETPLACE_EXTN_URL =
  "https://marketplace.visualstudio.com/items?itemName=";
const postURl = "http://localhost:3001/extensions";
import { exec } from "child_process";
import pkg from "node-machine-id";
const { machineId } = pkg;
exec(CMD, async (error, stdout, stderr) => {
  if (error) {
    console.error(`error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  const name = process.argv[2];
  if (!name) {
    console.error("Provide name as a first argument");
    return "Provide name as a first argument";
  }
  const resp = stdout.split("\n");
  resp.pop();
  let result = await Promise.all(
    resp.map(async (name) => {
      const detailedResp = await getExtensionDetails(name);
      return detailedResp.results[0].extensions[0];
    })
  );
  const res1 = result.map((extn) => {
    //console.log(extn);
    const finalResult = {};
    finalResult["publisherId"] = extn?.publisher?.publisherId;
    finalResult["publisherName"] = extn?.publisher?.publisherName;
    finalResult["publisherDomain"] = extn?.publisher?.domain;
    finalResult["publisherId"] = extn?.publisher?.publisherId;
    finalResult["extensionId"] = extn?.extensionId;
    finalResult["extensionName"] = extn?.extensionName;
    finalResult["displayName"] = extn?.displayName;
    finalResult["categories"] = extn?.categories;
    finalResult["shortDescription"] = extn?.shortDescription;
    finalResult["icon"] = extn?.versions[0]?.files
      .map((file) => {
        const att = file?.assetType;
        if (att.indexOf("Icons.Small") >= 0) {
          return file.source;
        }
      })
      .filter((n) => n)[0];
    finalResult["hrefLink"] =
      MARKETPLACE_EXTN_URL +
      "" +
      extn?.publisher?.publisherName +
      "." +
      extn?.extensionName;
    finalResult["installCount"] = extractStatistic(extn, "install");
    finalResult["downloadCount"] = extractStatistic(extn, "downloadCount");
    finalResult["averageRating"] = extractStatistic(extn, "averagerating");
    return finalResult;
  });
  const id = await getMachineId();

  const saveResponse = {
    id: id,
    name: name,
    extensions: res1,
  };
  const data = await fetch(postURl, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(saveResponse),
  });
  let responseData = await data.json();
  console.log(responseData.message);
});

function extractStatistic(extn, name) {
  const stat = extn?.statistics.find((s) => s.statisticName === name);
  if (!stat) {
    return 0;
  }
  return stat.value;
}
async function getExtensionDetails(fullExtensionName) {
  const [extensionName, _] = fullExtensionName.split("@");
  const MARKETPLACE_BASE_URL = "https://marketplace.visualstudio.com";
  const MARKETPLACE_EXTENSION_ENDPOINT = "/_apis/public/gallery/extensionquery";
  const url = `${MARKETPLACE_BASE_URL}${MARKETPLACE_EXTENSION_ENDPOINT}`;
  const resp = await fetch(`${url}?api-version=3.0-preview.1`, {
    // Adding method type
    method: "POST",
    // Adding body or contents to send
    body: JSON.stringify({
      assetTypes: null,
      filters: [
        {
          criteria: [{ filterType: 7, value: extensionName }],
          direction: 2,
          pageSize: 100,
          pageNumber: 1,
          sortBy: 0,
          sortOrder: 0,
          pagingToken: null,
        },
      ],
      flags: 914,
    }),

    // Adding headers to the request
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });
  // Converting to JSON
  const data = await resp.json();
  //console.log(data);
  return data;
}

async function getMachineId() {
  let id = await machineId();
  return id + "klkdadfddfdfddsdasdfdsfdsfdsfdsdd";
}
