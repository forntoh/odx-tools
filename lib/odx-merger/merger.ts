/* eslint-disable import/no-anonymous-default-export */

import { useState } from "react";
import { js2xml, xml2js } from "xml-js";
import {
  buildShortName,
  mergeODXFiles,
  readElementText,
  replaceElementAttribute,
  replaceElementText,
  restructureECUVariant,
} from "./helpers.odx";

export default (): [
  string,
  string,
  (files: Map<string, string>, longName: string) => void,
  () => void
] => {
  const [result, setResult] = useState("");
  const [fileName, setFileName] = useState("");

  const mergeFiles = async (files: Map<string, string>, longName: string) => {
    const data = Array.from(files.values()).map((it) => xml2js(it));

    const revision = readElementText(
      data[0],
      "ODX.DIAG-LAYER-CONTAINER.ECU-VARIANTS.ECU-VARIANT.ADMIN-DATA.DOC-REVISIONS.DOC-REVISION.REVISION-LABEL"
    );

    const shortName = buildShortName(longName, revision);
    setFileName(shortName + revision?.substring(3));

    replaceElementAttribute(
      data,
      "ODX.DIAG-LAYER-CONTAINER.ID",
      `DLC_${shortName}`
    );

    replaceElementText(data, "ODX.DIAG-LAYER-CONTAINER.LONG-NAME", longName);

    replaceElementText(
      data,
      "ODX.DIAG-LAYER-CONTAINER.SHORT-NAME",
      `DLC_${shortName}`
    );

    replaceElementText(
      data,
      "ODX.DIAG-LAYER-CONTAINER.ECU-VARIANTS.ECU-VARIANT.LONG-NAME",
      longName
    );

    replaceElementAttribute(
      data,
      "ODX.DIAG-LAYER-CONTAINER.ECU-VARIANTS.ECU-VARIANT.ID",
      shortName
    );

    replaceElementText(
      data,
      "ODX.DIAG-LAYER-CONTAINER.ECU-VARIANTS.ECU-VARIANT.SHORT-NAME",
      shortName
    );

    replaceElementText(
      data,
      "ODX.DIAG-LAYER-CONTAINER.ECU-VARIANTS.ECU-VARIANT.ECU-VARIANT-PATTERNS.ECU-VARIANT-PATTERN.MATCHING-PARAMETERS.MATCHING-PARAMETER.EXPECTED-VALUE",
      shortName.substring(0, shortName.lastIndexOf("_"))
    );

    mergeODXFiles(data, "ODX.DIAG-LAYER-CONTAINER.ECU-VARIANTS.ECU-VARIANT", [
      ["IMPORT-REFS", "ID-REF"],
      ["POS-RESPONSES", "ID"],
      ["REQUESTS", "ID"],
      ["DIAG-COMMS", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.DTC-DOPS", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.DTC-DOPS.DTC-DOP.DTCS", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.DATA-OBJECT-PROPS", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.STRUCTURES", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.END-OF-PDU-FIELDS", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.MUXS", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.UNIT-SPEC.UNITS", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.UNIT-SPEC.PHYSICAL-DIMENSIONS", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.TABLES", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.TABLES.TABLE", "ID"],
      ["DIAG-DATA-DICTIONARY-SPEC.TABLES.TABLE", "ID-REF"],
    ]);

    const i = restructureECUVariant(data);

    // Convert to XML
    const res = js2xml(data[i]!, {
      compact: false,
      spaces: 2,
    });

    setResult(res);
  };

  const clearResult = () => setResult("");

  return [result, fileName, mergeFiles, clearResult];
};
