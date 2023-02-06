import { Element, ElementCompact } from "xml-js";

// Build a short name following the ODX standard
const buildShortName = (longName: string, revision?: string) => {
  let name = "EV_";

  longName.split("_").forEach((it) => {
    name += it.substring(0, 5);
  });

  return name + "_" + (revision?.substring(0, 3) ?? "001");
};

const mergeODXFiles = (
  files: (Element | ElementCompact)[],
  root: string,
  components: string[][]
) => {
  components.forEach((item) => {
    mergeChildren(files as Element[], `${root}.${item[0]}`, item[1]);
  });
};

const readElementText = (
  element: Element | ElementCompact,
  tagName: string
): string | undefined => {
  const dotIndex = tagName.indexOf(".");

  let result: string | undefined = "";

  if (dotIndex >= 0) {
    result = readElementText(
      element?.elements!.find(
        (it: { name: string }) => it?.name == tagName.substring(0, dotIndex)
      )!,
      tagName.substring(dotIndex + 1)
    );
  } else {
    return element.elements.find((it: { name: string }) => it?.name == tagName)
      .elements[0].text;
  }
  return result;
};
/**
 * Replave the value of at attribute in an odx block
 * @param elements The data
 * @param attribute Location to the attribute to replace in the tree e.g ODX.DIAG-LAYER-CONTAINER.ID
 * @param value The new value
 */
const replaceElementAttribute = (
  elements: (Element | ElementCompact)[],
  attribute: string,
  value: string
) => {
  const dotIndex = attribute.indexOf(".");

  if (dotIndex >= 0) {
    replaceElementAttribute(
      (elements as Element[])?.map(
        (v) =>
          v?.elements!.find(
            (it) => it?.name == attribute.substring(0, dotIndex)
          )!
      ),
      attribute.substring(dotIndex + 1),
      value
    );
  } else {
    for (let i = 0; i < elements.length; i++) {
      elements[i].attributes[attribute] = value;
    }
  }
};
/**
 * Replace the text value of a block/element
 * @param elements Data
 * @param tagName Location of the element/item to replace e.g. ODX.DIAG-LAYER-CONTAINER.SHORT-NAME
 * @param value The new value
 */
const replaceElementText = (
  elements: (Element | ElementCompact)[],
  tagName: string,
  value: string
) => {
  const dotIndex = tagName.indexOf(".");

  if (dotIndex >= 0) {
    replaceElementText(
      (elements as Element[])?.map(
        (v) =>
          v?.elements!.find((it) => it?.name == tagName.substring(0, dotIndex))!
      ),
      tagName.substring(dotIndex + 1),
      value
    );
  } else {
    for (let i = 0; i < elements.length; i++) {
      elements[i].elements.find(
        (it: { name: string }) => it?.name == tagName
      ).elements[0].text = value;
    }
  }
};
/**
 * Merge the children of a block in place
 * @param elements The data to merge
 * @param tagName Target tag name
 * @param attribute Attribute to merge by
 */
const mergeChildren = (
  elements: Element[],
  tagName: string,
  attribute: string
) => {
  elements = elements.filter((e) => e !== undefined);

  const dotIndex = tagName.indexOf(".");

  if (dotIndex >= 0) {
    mergeChildren(
      elements?.map(
        (v) =>
          v?.elements!.find((it) => it?.name == tagName.substring(0, dotIndex))!
      ),
      tagName.substring(dotIndex + 1),
      attribute
    );
  } else {
    for (let k = 0; k < elements.length; k++) {
      const sub = elements[k]?.elements?.find((it) => it?.name == tagName);

      if (!sub) {
        const toAdd = elements
          .find((it) => it.elements?.find((t) => t?.name == tagName))
          ?.elements?.find((it) => it.name == tagName)!;
        if (toAdd) elements[k].elements?.push(toAdd);
      }
    }
  }

  for (let i = 0; i < elements.length - 1; i++) {
    var m = elements[i]?.elements?.findIndex((elt) => elt?.name == tagName);
    var n = elements[i + 1]?.elements?.findIndex((elt) => elt?.name == tagName);

    if (m == -1 || m == undefined || n == -1 || n == undefined) return;

    for (let i = 0; i < elements.length - 1; i++) {
      const firstType = elements[i].elements?.[m]?.type;
      const firstName = elements[i].elements?.[m]?.name;
      const firstId = elements[i].elements?.[m]?.attributes?.[attribute];

      const secondType = elements[i + 1].elements?.[n]?.type;
      const secondName = elements[i + 1].elements?.[n]?.name;
      const secondId = elements[i + 1].elements?.[n]?.attributes?.[attribute];

      if (
        firstType == secondType &&
        firstName == secondName &&
        firstId == secondId
      ) {
        mergeAttribute(
          attribute,
          elements[i + 1].elements![n],
          elements[i].elements![m]
        );
        mergeAttribute(
          attribute,
          elements[i].elements![m],
          elements[i + 1].elements![n]
        );
      }
    }

    for (let i = elements.length - 1; i > 0; i--) {
      const firstType = elements[i].elements?.[m]?.type;
      const firstName = elements[i].elements?.[m]?.name;
      const firstId = elements[i].elements?.[m]?.attributes?.[attribute];

      const secondType = elements[i - 1].elements?.[n]?.type;
      const secondName = elements[i - 1].elements?.[n]?.name;
      const secondId = elements[i - 1].elements?.[n]?.attributes?.[attribute];

      if (
        firstType == secondType &&
        firstName == secondName &&
        firstId == secondId
      ) {
        mergeAttribute(
          attribute,
          elements[i - 1].elements![n],
          elements[i].elements![m]
        );
        mergeAttribute(
          attribute,
          elements[i].elements![m],
          elements[i - 1].elements![n]
        );
      }
    }
  }
};
/**
 * Merge data from two blocks in place.
 * The result is always placed in the second item.
 *
 * @param param The block to merge
 * @param first First item
 * @param second Second item
 */
const mergeAttribute = (param: string, first: Element, second: Element) => {
  if (first == undefined || second == undefined) return;

  for (let i = 0; i < first.elements!.length; i++) {
    const element = first.elements![i];

    const search = second.elements?.find(
      (elt) => elt.attributes?.[param] == element.attributes?.[param]
    );

    if (!search && element) {
      if (element.name == "KEY-DOP-REF")
        return; //second.elements?.splice(2, 0, element);
      else second.elements?.push(element);
    }
  }
};
/**
 * Restructure the merge result to follow the ODX standard
 * @param data The data to restructure (array of odx files conveted to js objects)
 * @returns the index of largest merged file (it will contain data from all the files)
 */
const restructureECUVariant = (data: (Element | ElementCompact)[]) => {
  let longestItem;
  let longestItemRootIndex = 0;
  //
  // Search for the result with the most data
  //
  data.forEach((it, i) => {
    const sub = it.elements?.[0]?.elements?.[0].elements?.[2].elements?.[0]
      .elements?.[5].elements as Element[];

    if (sub.length > (longestItem?.length ?? 0)) {
      longestItem = sub;
      longestItemRootIndex = i;
    }
  });
  //
  // Restructure content of the result with the most data
  //
  const sub = data[longestItemRootIndex]?.elements?.[0]?.elements?.[0]
    ?.elements?.[2]?.elements?.[0]?.elements?.[5] as Element;

  let looker: Element[] = new Array(13);

  for (let i = 0; i < sub.elements!.length; i++) {
    const element = sub.elements![i];
    switch (element.name) {
      case "ADMIN-DATA":
        looker[0] = element;
        break;
      case "DTC-DOPS":
        looker[1] = element;
        break;
      case "ENV-DATA-DESCS":
        looker[2] = element;
        break;
      case "DATA-OBJECT-PROPS":
        looker[3] = element;
        break;
      case "STRUCTURES":
        looker[4] = element;
        break;
      case "STATIC-FIELDS":
        looker[5] = element;
        break;
      case "DYNAMIC-LENGTHFIELDS":
        looker[6] = element;
        break;
      case "DYNAMIC-ENDMARKERFIELDS":
        looker[7] = element;
        break;
      case "END-OF-PDU-FIELDS":
        looker[8] = element;
        break;
      case "MUXS":
        looker[9] = element;
        break;
      case "ENV-DATAS":
        looker[10] = element;
        break;
      case "UNIT-SPEC":
        looker[11] = element;
        break;
      case "TABLES":
        looker[12] = element;
        break;
      default:
        break;
    }
  }
  //
  // Remove all empty items
  //
  looker = looker.filter((e) => e !== undefined);
  //
  // Replace the previous value with the restructured one
  //
  data[
    longestItemRootIndex
  ].elements![0]!.elements![0]!.elements![2]!.elements![0]!.elements![5].elements =
    looker;
  //
  return longestItemRootIndex;
};

export {
  mergeAttribute,
  mergeChildren,
  mergeODXFiles,
  replaceElementText,
  replaceElementAttribute,
  restructureECUVariant,
  buildShortName,
  readElementText,
};
