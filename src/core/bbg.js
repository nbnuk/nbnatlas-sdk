import { SpeciesWS } from '../services/species-ws.js'
import { rejectInvalidRequest, ERROR_MESSAGES } from '../validation/index.js'
import { SPECIES_LIST, LAYERS } from '../config/index.js'
import { Places } from './places.js'

/**
 * @classdesc Represents the Beautiful Burial Grounds SDK.
 * @memberof NBNAtlas
 */
export class BBG {

    constructor() {
        this.places = new Places(LAYERS.BEAUTIFUL_BURIAL_GROUNDS)
        this.speciesWS = new SpeciesWS();
    }

    /**
     * @description Returns the seek advice data.
     * @async
     * @example
     * NBNAtlas.bbg.getSeekAdviceData('Croydon Cemetery')
     * .then(data=>
     *   console.log(JSON.stringify(data))
     *  );
     * 
     * @param {string} placeName - The unique name of the place
     * @return {Promise<Array<NBNAtlas.OccurrenceCount>>}
     *   
     */
    async getSeekAdviceData(placeName) {
        if (!placeName) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
        return this.places.getOccurrenceCountForSpeciesList([placeName], SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE)
    }

    /**
     * @description Returns the seek advice data.
     * @async
     * @example
     * NBNAtlas.bbg.getSeekAdviceDataForAssetID('615214')
     * .then(data=>
     *   console.log(JSON.stringify(data))
     * );
     *
     * @param {string} assetID
     * @return {Promise<Array<NBNAtlas.OccurrenceCount>>}
     *
     */
    async getSeekAdviceDataForAssetID(assetID) {
        if (!assetID) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_ASSET_ID);
        }
        let asset = await this.speciesWS.getBBGPlacesForAssetID(assetID);
        return this.places.getOccurrenceCountForSpeciesList(asset.places, SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE);
    }

    /**
     * @description Returns the digest table data.
     * @async
     * @example
     * NBNAtlas.bbg.getDigestTableData('Croydon Cemetery')
     * .then(data=>
     *   console.log(JSON.stringify(data))
     *  );
     *
     * @param {string} placeName - The unique name of the place
     * @return {Promise<Array<NBNAtlas.SpeciesCountByGroup>>}
    */
    async getDigestTableData(placeName) {
        if (!placeName) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
        return this.places.getSpeciesCountByGroup([placeName], SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE)
    }

    /**
     * @description Returns the digest table data.
     * @async
     * @example
     * NBNAtlas.bbg.getDigestTableDataForAssetID('615214')
     * .then(data=>
     *   console.log(JSON.stringify(data))
     *  );
     *
     * @param {string} assetID
     * @return {Promise<Array<NBNAtlas.SpeciesCountByGroup>>}
     */
    async getDigestTableDataForAssetID(assetID) {
        if (!assetID) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_ASSET_ID);
        }
        let asset = await this.speciesWS.getBBGPlacesForAssetID(assetID);
        return this.places.getSpeciesCountByGroup(asset.places, SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE)
    }

    /**
     * @description Returns a BBG site or place.
     * @async
     * @example
     * NBNAtlas.bbg.getPlace('Baildon: St James')
     * .then(data=>
     *   console.log(JSON.stringify(data))
     *  );
     *
     * @param {string} placeName - The unique name of the place
     * @return {Promise<NBNAtlas.BBGPlace>}
    */
    async getPlace(placeName) {
        if (!placeName) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
        return this.speciesWS.getBBGPlace(placeName);
    }

}


export const bbg = new BBG();