import { RecordsWS } from '../services/records-ws'
import { ListsWS } from '../services/lists-ws'
import {rejectInvalidRequest, ERROR_MESSAGES} from '../validation/index'
import {getJson} from '../util/index'
import {CONFIG} from '../config/config'

/**
 * @classdesc Represents the NBN Places SDK. In Beta!!
 * @memberof NBNAtlas
 */
 export class Places {

    /**
     * Create a place.
     * @param {number} layerId - The NBN layer id.
    */
    constructor(layerId) {
        this.layerId = layerId;
        this.recordsWS = new RecordsWS();
        this.listsWS = new ListsWS();
    }

    /**
     * Returns the species count grouped by species group.
     * @async
     * @example
     * NBNAtlas.places(NBNAtlas.LAYERS.BEAUTIFUL_BURIAL_GROUNDS).getSpeciesCountByGroup('Croydon Cemetery', NBNAtlas.SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE)
     *
     * @param {string} placeName - The unique name of the place
     * @param {string} [selectedspeciesListId] - The id of a species list for which a grouped count is also returned.
     * @return {Promise<Array<NBNAtlas.typedefs.SpeciesCountByGroup>>}
     */
    async getSpeciesCountByGroup(placeName, selectedspeciesListId) {
        if (!placeName) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
       
        const speciesCountByGroupDTO = await this.recordsWS.getSpeciesCountByGroup({layerId:this.layerId, placeName});

        let selectedSpeciesCountByGroupDTO = selectedspeciesListId ? 
            await this.recordsWS.getSpeciesCountByGroupForSpeciesList({layerId:this.layerId, placeName, speciesListId:selectedspeciesListId}) : [];
      
        return this._buildSpeciesCountByGroupResult(speciesCountByGroupDTO, selectedSpeciesCountByGroupDTO);
    }

    /**
     * Returns the occurrence counts.
     * @example
     * NBNAtlas.places(NBNAtlas.LAYERS.BEAUTIFUL_BURIAL_GROUNDS).getOccurrenceCount('Argyll Biological Records Centre')
     *
     * @param {string} placeName - The unique name of the place.
     * @return {Promise<Array<NBNAtlas.typedefs.OccurrenceCount>>}
     */
    async getOccurrenceCount(placeName) {
        if (!placeName) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
        
        let result = [];
        const occurrenceCountDTO = await this.recordsWS.getOccurrenceCount({layerId:this.layerId, placeName});
        if (occurrenceCountDTO) {
            const sensitiveInWalesDTO = await getJson(CONFIG.SENSITIVE_IN_WALES_JSON);
            const sensitiveInEnglandDTO = await getJson(CONFIG.SENSITIVE_IN_ENGLAND_JSON);

            result = this._buildOccurrenceCountResult(occurrenceCountDTO, sensitiveInWalesDTO, sensitiveInEnglandDTO);
        }

        return result;
    }


    /**
    * Returns the occurrence counts for a species list.
    * @async
    * @example
    * NBNAtlas.places(NBNAtlas.LAYERS.BEAUTIFUL_BURIAL_GROUNDS).getOccurrenceCount('Argyll Biological Records Centre')
    *
    * @param {string} placeName - The unique name of the place.
    * @param {string} speciesListId - The species list id.
    * @return {Promise<Array<NBNAtlas.typedefs.OccurrenceCount>>}
    */
    async getOccurrenceCountForSpeciesList(placeName, speciesListId) {
        if (!placeName) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
        if (!speciesListId) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_SPECIES_LIST_ID);
        }
        const speciesListDTO = await this.listsWS.getSpeciesList(speciesListId);

        let result = [];
        const occurrenceCountDTO = await this.recordsWS.getOccurrenceCountForSpeciesList({layerId:this.layerId, placeName, speciesListId});
     
        if (occurrenceCountDTO) {
            const sensitiveInWalesDTO = await getJson(CONFIG.SENSITIVE_IN_WALES_JSON);
            const sensitiveInEnglandDTO = await getJson(CONFIG.SENSITIVE_IN_ENGLAND_JSON);

            result = this._buildOccurrenceCountForSpeciesListResult(speciesListDTO, occurrenceCountDTO, sensitiveInWalesDTO, sensitiveInEnglandDTO);
        }

        return result;
    }



    /**
     * @private
     */
    _buildSpeciesCountByGroupResult(speciesCountByGroupDTO, selectedSpeciesCountByGroupDTO) {
        const map = new Map();

        speciesCountByGroupDTO.forEach(it => map.set(it.name,
            {
                speciesGroup: it.name,
                speciesCount: it.speciesCount,
                selectedSpeciesCount: 0
            }
        ));

        selectedSpeciesCountByGroupDTO.forEach(it => {
            let val = map.get(it.name);

            if (!val) {
                map.set(it.name, {
                    speciesGroup: it.name,
                    speciesCount: 0,
                    selectedSpeciesCount: it.speciesCount
                });
            } else {
                val = {
                    ...val,
                    selectedSpeciesCount: it.speciesCount
                };
            }

        });

        return [...map.values()];

    }


    /**
     * @private
     */
    _buildOccurrenceCountResult(occurrenceCountDTO, sensitiveInEnglandDTO, sensitiveInWalesDTO) {
        if (!occurrenceCountDTO) {
            return {}
        }
        const england = this._sensitiveSpeciesJSONToMap(sensitiveInEnglandDTO);
        const wales = this._sensitiveSpeciesJSONToMap(sensitiveInWalesDTO);
        return occurrenceCountDTO.map(it => (
            {
                scientificName: it.additional.scientificName,
                commonName: it.additional.commonName,
                taxonGuid: it.additional.taxonGuid,
                count: it.count,
                sensitiveInEngland: england[it.additional.taxonGuid] ? true : false,
                sensitiveInWales: wales[it.additional.taxonGuid] ? true : false
            }
        ));
    }

    /**
     * @private
     */
    _buildOccurrenceCountForSpeciesListResult(speciesListDTO, occurrenceCountDTO, sensitiveInEnglandDTO, sensitiveInWalesDTO) {
        if (!occurrenceCountDTO) {
            return {}
        }
        const england = this._sensitiveSpeciesJSONToMap(sensitiveInEnglandDTO);
        const wales = this._sensitiveSpeciesJSONToMap(sensitiveInWalesDTO);
        return speciesListDTO.map(it => (
            {
                scientificName: it.scientificName,
                commonName: it.commonName,
                taxonGuid: it.lsid,
                count: this._getOccurrenceCount(it.lsid, occurrenceCountDTO),
                sensitiveInEngland: england[it.lsid] ? true : false,
                sensitiveInWales: wales[it.lsid] ? true : false
            }
        ));
    }

    /**
    * @private 
    */
    _getOccurrenceCount(taxonGuid, occurrenceCountDTO) {
        let count = 0;
        occurrenceCountDTO.some(it => {
            if (it.additional.taxonGuid === taxonGuid) {
                count = it.count;
                return true;
            }
            return false;
        });
        return count;
    }

    /**
     * @private
     */
    _sensitiveSpeciesJSONToMap(json) {
        return json.reduce((map, obj) => {
            map[obj.guid] = obj;
            return map;
        }, {});
    }

   

}

export var places = function (layerId) {
	return new Places(layerId);
};
