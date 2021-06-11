import { SpeciesWS } from '../services/species-ws'
import { rejectInvalidRequest, ERROR_MESSAGES } from '../validation/index'
import { SPECIES_LIST, LAYERS } from '../../src/config/index'
import { Places } from './places'

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
     * 
     * @param {string} placeName - The unique name of the place
     * @return {Promise<Array<NBNAtlas.OccurrenceCount>>}
     *   
     */
    async getSeekAdviceData(placeName) {
        return this.places.getOccurrenceCountForSpeciesList(placeName, SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE)
    }

    /**
     * @description Returns the digest table data.
     * @async
     * @example
     * NBNAtlas.bbg.getDigestTableData('Croydon Cemetery')
     *
     * @param {string} placeName - The unique name of the place
     * @return {Promise<Array<NBNAtlas.SpeciesCountByGroup>>}
    */
    async getDigestTableData(placeName) {
        return this.places.getSpeciesCountByGroup(placeName, SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE)
    }

    /**
     * @description Returns a BBG site or place.
     * @async
     * @example
     * NBNAtlas.bbg.getPlace('Baildon: St James')
     *
     * @param {string} placeName - The unique name of the place
     * @return {Promise<NBNAtlas.BBGPlace>}
    */
    async getPlace(placeName) {
        if (!placeName) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
        return await this.speciesWS.getBBGPlace(placeName);
    }


}


export const bbg = new BBG();