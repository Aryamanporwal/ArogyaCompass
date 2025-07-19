
export async function summarizeFromMedlinePlus(query: string): Promise<string | null> {
  try {
    const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(query)}&retmax=1`;
    const res = await fetch(url);
    const xml = await res.text();

    const match = xml.match(/<title>(.*?)<\/title>[\s\S]*?<snippet>(.*?)<\/snippet>/);
    if (match) {
      return `${match[1]}: ${match[2]}`;
    } else {
      return null;
    }
  } catch (err) {
    console.error("MedlinePlus Error", err);
    return null;
  }
}

export async function getDrugInfoFromRxNorm(drugName: string): Promise<string | null> {
  try {
    const rxcuiResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}`);
    const rxcuiData = await rxcuiResponse.json();
    const rxcui = rxcuiData?.idGroup?.rxnormId?.[0];

    if (!rxcui) return null;

    const propsResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
    const propsData = await propsResponse.json();

    const name = propsData?.properties?.name;
    const synonyms = propsData?.properties?.synonym;

    return `Drug Info from RxNorm: ${name} (${synonyms || 'N/A'})`;
  } catch (err) {
    console.error("RxNorm Error", err);
    return null;
  }
}
