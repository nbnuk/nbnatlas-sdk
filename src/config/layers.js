/** 
 * Layer ID's
 * @memberof NBNAtlas
 * @property {string} BEAUTIFUL_BURIAL_GROUNDS
*/
export const LAYERS = {
    BEAUTIFUL_BURIAL_GROUNDS : "cl273",
}


/**
 * @typedef {Object}
 * @memberof NBNAtlas
 * @name SpeciesCountByGroup
 * @property {string} speciesGroup - The species group
 * @property {number} speciesCount - The number of species counted
 * @property {number} selectedSpeciesCount - The number of species counted that are of selected interest 
 */

/**
 * @typedef {Object}
 * @memberof NBNAtlas
 * @name OccurrenceCount
 * @property {string} scientificName
 * @property {string} commonName
 * @property {string} taxonGuid
 * @property {number} count
 * @property {boolean} sensitiveInEngland - true if species is sensitive in England
 * @property {boolean} sensitiveInWales - true if species is sensitive in Wales
 */

/**
 * @typedef {Object}
 * @memberof NBNAtlas
 * @name Place
 * @property {string} id
 * @property {number} name
 */

/**
 * @typedef {Object}
 * @memberof NBNAtlas
 * @name BBGPlace
 * @property {string} assetID
 * @property {number} name
 */