import { RecordsWS } from '../services/records-ws.js'
import { ListsWS } from '../services/lists-ws.js'
import {rejectInvalidRequest, ERROR_MESSAGES} from '../validation/index.js'
import {SPECIES_LIST} from '../config/index.js'

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
     * NBNAtlas.places(NBNAtlas.LAYERS.BEAUTIFUL_BURIAL_GROUNDS)
     *                  .getSpeciesCountByGroup(['Croydon Cemetery'],
     *                                          NBNAtlas.SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE)
     * .then(data=>
     *   console.log(JSON.stringify(data))
     *  );
     *
     * @param {string[]} placeNames - Array of place names.
     * @param {string} [selectedspeciesListId] - The id of a species list for which a grouped count is also returned.
     * @return {Promise<Array<NBNAtlas.typedefs.SpeciesCountByGroup>>}
     */
    async getSpeciesCountByGroup(placeNames, selectedspeciesListId) {
        if (!placeNames || !placeNames.length) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
       
        const speciesCountByGroupDTO = await this.recordsWS.getSpeciesCountByGroup({layerId:this.layerId, placeNames});

        let selectedSpeciesCountByGroupDTO = selectedspeciesListId ? 
            await this.recordsWS.getSpeciesCountByGroupForSpeciesList({layerId:this.layerId, placeNames, speciesListId:selectedspeciesListId}) : [];
      
        return this._buildSpeciesCountByGroupResult(speciesCountByGroupDTO, selectedSpeciesCountByGroupDTO);
    }

    /**
     * Returns the occurrence counts.
     * @example
     * NBNAtlas.places(NBNAtlas.LAYERS.BEAUTIFUL_BURIAL_GROUNDS).getOccurrenceCount(['Argyll Biological Records Centre'])
     * .then(data=>
     *   console.log(JSON.stringify(data))
     *  );
     *
     * @param {string[]} placeNames - Array of place names.
     * @return {Promise<Array<NBNAtlas.typedefs.OccurrenceCount>>}
     */
    async getOccurrenceCount(placeNames) {
        if (!placeNames) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
        
        let result = [];
        const occurrenceCountDTO = await this.recordsWS.getOccurrenceCount({layerId:this.layerId, placeNames});
        if (occurrenceCountDTO) {
            const sensitiveInWalesDTO = await this.listsWS.getSpeciesList(SPECIES_LIST.SENSITIVE_IN_WALES);
            const sensitiveInEnglandDTO = await this.listsWS.getSpeciesList(SPECIES_LIST.SENSITIVE_IN_ENGLAND);

            result = this._buildOccurrenceCountResult(occurrenceCountDTO, sensitiveInWalesDTO, sensitiveInEnglandDTO);
        }

        return result;
    }

    /**
    * Returns the occurrence counts for a species list.
    * @async
    * @example
    * NBNAtlas.places(NBNAtlas.LAYERS.BEAUTIFUL_BURIAL_GROUNDS)
     *                  .getOccurrenceCountForSpeciesList(['Argyll Biological Records Centre'],
     *                                                     NBNAtlas.SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE)
     * .then(data=>
     *   console.log(JSON.stringify(data))
     *  );
     *
     * @param {string[]} placeNames - Array of place names.
    * @param {string} speciesListId - The species list id.
    * @return {Promise<Array<NBNAtlas.typedefs.OccurrenceCount>>}
    */
    async getOccurrenceCountForSpeciesList(placeNames, speciesListId) {
        if (!placeNames) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_PLACE_NAME);
        }
        if (!speciesListId) {
            return rejectInvalidRequest(ERROR_MESSAGES.MISSING_SPECIES_LIST_ID);
        }
        const speciesListDTO = await this.listsWS.getSpeciesList(speciesListId);

        let result = [];
        const occurrenceCountDTO = await this.recordsWS.getOccurrenceCountForSpeciesList({layerId:this.layerId, placeNames, speciesListId});
        if (occurrenceCountDTO && occurrenceCountDTO.length) {
            const sensitiveInWalesDTO = await this.listsWS.getSpeciesList(SPECIES_LIST.SENSITIVE_IN_WALES);
            const sensitiveInEnglandDTO = await this.listsWS.getSpeciesList(SPECIES_LIST.SENSITIVE_IN_ENGLAND);

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
                sensitiveInEngland: !!england[it.additional.taxonGuid],
                sensitiveInWales: !!wales[it.additional.taxonGuid]
            }
        ));
    }

    /**
     * @private
     */
    _buildOccurrenceCountForSpeciesListResult(speciesListDTO, occurrenceCountDTO, sensitiveInEnglandDTO, sensitiveInWalesDTO) {
        if (!occurrenceCountDTO || occurrenceCountDTO.length === 0) {
            return {}
        }
        const england = this._sensitiveSpeciesJSONToMap(sensitiveInEnglandDTO);
        const wales = this._sensitiveSpeciesJSONToMap(sensitiveInWalesDTO);
        const result =  speciesListDTO.map(it => {
            let countAndLastRecorded = this._getOccurrenceCountAndLastRecorded(it.lsid, occurrenceCountDTO);

            return(
                {
                scientificName:it.scientificName,
                commonName:it.commonName,
                taxonGuid:it.lsid,
                lastRecorded:countAndLastRecorded.lastRecorded,
                count:countAndLastRecorded.count,
                sensitiveInEngland:!!england[it.lsid],
                sensitiveInWales:!!wales[it.lsid]
                }
            )
        });

        const batCount = occurrenceCountDTO[occurrenceCountDTO.length-1];
        if (batCount.additional.scientificName==="Chiroptera"){
            result.push({
                scientificName:batCount.additional.scientificName,
                commonName:batCount.additional.commonName,
                taxonGuid:batCount.additional.taxonGuid,
                lastRecorded:batCount.year,
                count:batCount.count,
                sensitiveInEngland:true,
                sensitiveInWales:false
            })
        }
        return result;
    }

    /**
    * @private 
    */
    _getOccurrenceCountAndLastRecorded(taxonGuid, occurrenceCountDTO) {
        let result = {count:0,lastRecorded:0}

        occurrenceCountDTO.some(it => {
            if (it.additional.taxonGuid === taxonGuid) {
                result = {
                    count:it.count,
                    lastRecorded:it.year
                }
                return true;
            }
            return false;
        });
        return result;
    }

    /**
     * @private
     */
    _sensitiveSpeciesJSONToMap(json) {
        return json.reduce((map, obj) => {
            map[obj.lsid] = obj;
            return map;
        }, {});
    }

   

}

export var places = function (layerId) {
	return new Places(layerId);
};
