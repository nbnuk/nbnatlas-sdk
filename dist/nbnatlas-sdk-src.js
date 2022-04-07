/* @preserve
 * A JS SDK for NBN Atlas. https://nbnatlas.org/
 * Author: Helen Manders-Jones helenmandersjones@gmail.com
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.NBNAtlas = {}));
}(this, (function (exports) { 'use strict';

    /** 
         * @private
         */
     async function getJson(url) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, { signal: controller.signal });

        if (response.status >= 400) {
            return Promise.reject({
                status: response.status,
                message: response.statusText,
                body: response.data
            });
        }
        if (response.status >= 200 && response.status <= 202) {
            const json = await response.json();
            return json;
        }
        return {};
    }

    function encodeAndJoin(items, separator = " OR "){
        let encodedItems= items.map(it => encodeURIComponent('"' + it + '"'));
        return encodedItems.join("OR");
    }

    /**
     * @private
     */
    const CONFIG = {
        URL_RECORDS_WS: 'https://records-ws.nbnatlas.org',
        URL_SPECIES_WS: 'https://species-ws-dev.nbnatlas.org',
        URL_LISTS_WS: 'https://lists.nbnatlas.org'
    };

    /** 
     * Layer ID's
     * @memberof NBNAtlas
     * @property {string} BEAUTIFUL_BURIAL_GROUNDS
    */
    const LAYERS = {
        BEAUTIFUL_BURIAL_GROUNDS : "cl273",
    };


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
     * @property {number} lastRecorded - year of most recent occurrence record, 0 if not known
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

    /** 
     * Species List ID's
     * @memberof NBNAtlas
     * @property {string} BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE
     * @property {string} BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE
     * @property {string} SENSITIVE_IN_ENGLAND
     * @property {string} SENSITIVE_IN_WALES
    */
    const SPECIES_LIST = {
        BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE: "dr2504",
        BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE: "dr2492",
        SENSITIVE_IN_ENGLAND: "dr2058",
        SENSITIVE_IN_WALES: "dr2067"
    };

    /**
    * @private
    */
    class SpeciesWS {

        async getBBGPlace(placeName) {
            let url = this._buildGetPlaceUrl(placeName);
            let json = await this._getJson(url);
            return this._buildBBGPlaceDTO(json);
        }


        async getBBGPlacesForAssetID(assetID) {
            let url = `${CONFIG.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=assetid_s:${assetID}`;        let json = await this._getJson(url);
            return this._buildBBGAssetDTO(json);
        }



        /**
          * @private
          */
        _buildBBGPlaceDTO(json) {
            //let result = json.searchResults?.results?.[0];
            let result = json.searchResults && json.searchResults.results && json.searchResults.results[0] ?
                json.searchResults.results[0] : null;
            return result ? {
                assetID: result.assetid_s,
                name: result.bbg_name_s
            }
                : [];
        }

        _buildBBGAssetDTO(json) {
            //let result = json.searchResults?.results?.[0];
            let result = json.searchResults && json.searchResults.results && json.searchResults.results.length>0 ?
                json.searchResults.results : null;
            return result ? {
                    assetID:result[0].assetid_s,
                    assetName:result[0].name_s,
                    places:result.map(it=>it.bbg_name_s)
                }
                : {};
        }

        /**
          * @private
          */
        _buildGetPlaceUrl(placeName) {
            return `${CONFIG.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=name:${encodeURIComponent('"' + placeName + '"')}`;
        }


        /** @private */
        _getJson(url) {
            return getJson(url)
        }

    }

    /**
     * @private
     */
     const ERROR_MESSAGES = {
        MISSING_PLACE_NAME: "Missing place name",
        MISSING_SPECIES_LIST_ID: "Missing species list id",
        MISSING_ASSET_ID: "Missing asset id",
    };

    /**
        * @private
    */
    function rejectInvalidRequest(message) {
        return Promise.reject({
            status: "INVALID",
            message: message
        });
    }

    /**
    * @private
    */
    class RecordsWS {


        async getSpeciesCountByGroup({layerId, placeNames}) {
            let url = `${CONFIG.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${layerId}:(${encodeAndJoin(placeNames)})&fq=-occurrence_status:absent`;
            let json = await this._getJson(url);
            return this._buildSpeciesCountByGroupDTO(json);
        }

        async getSpeciesCountByGroupForSpeciesList({layerId, placeNames, speciesListId}) {
            let url = `${CONFIG.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${layerId}:(${encodeAndJoin(placeNames)})&fq=-occurrence_status:absent`;
            url = `${url}&fq=species_list_uid:${speciesListId}`;
            let json = await this._getJson(url);
            return this._buildSpeciesCountByGroupDTO(json);
        }

        async getOccurrenceCount({layerId, placeNames}) {
            const url = `${CONFIG.URL_RECORDS_WS}/occurrences/search?q=${layerId}:(${encodeAndJoin(placeNames)})&facets=names_and_lsid&pageSize=1&flimit=-1
                                &fq=-occurrence_status:absent&sort=year&dir=desc&fl=year`;
            const json = await this._getJson(url);
            return this._buildOccurrenceCountDTO(json)
        }

        async getOccurrenceCountForSpeciesList({layerId, placeNames, speciesListId}) {
            const url = `${CONFIG.URL_RECORDS_WS}/occurrences/search?q=${layerId}:(${encodeAndJoin(placeNames)})&facets=names_and_lsid&pageSize=1&flimit=-1
                            &fq=-occurrence_status:absent&fq=species_list_uid:${speciesListId}&sort=year&dir=desc&fl=year`;

            const json = await this._getJson(url);
            return this._buildOccurrenceCountDTO(json)
        }

        /**
        * @private
        */
        _buildSpeciesCountByGroupDTO(json) {
            return json;
        }

        /**
         * @private
         */
        _buildOccurrenceCountDTO(json) {
            //let result = json.facetResults?.[0]?.fieldResult?.map(it => {
            let year = json.occurrences && json.occurrences[0] && json.occurrences[0].year ? json.occurrences[0].year:0;
            let result = json.facetResults && json.facetResults[0] && json.facetResults[0].fieldResult ?
                json.facetResults[0].fieldResult.map(it => {
                    const label = it.label.split('|');
                    return {
                        ...it,
                        year,
                        additional: {
                            scientificName: label[0],
                            commonName: label[2],
                            taxonGuid: label[1]
                        }
                    };
                }) : [];

            return result;
        }

        /** @private */
        _getJson(url) {
            return getJson(url)
        }
    }

    /**
    * @private
    */
    class ListsWS {

        async getSpeciesList(speciesListId) {
            let url = `${CONFIG.URL_LISTS_WS}/ws/speciesListItems/${speciesListId}`;
            let json = await getJson(url);
            return this._buildSpeciesListDTO(json);
        }


        /**
        * @private
        */
        _buildSpeciesListDTO(json) {
            return json;
        }

    }

    /**
     * @classdesc Represents the NBN Places SDK. In Beta!!
     * @memberof NBNAtlas
     */
     class Places {

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
            if (occurrenceCountDTO) {
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
            if (!occurrenceCountDTO) {
                return {}
            }
            const england = this._sensitiveSpeciesJSONToMap(sensitiveInEnglandDTO);
            const wales = this._sensitiveSpeciesJSONToMap(sensitiveInWalesDTO);
            return speciesListDTO.map(it => {
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
        }

        /**
        * @private 
        */
        _getOccurrenceCountAndLastRecorded(taxonGuid, occurrenceCountDTO) {
            let result = {count:0,lastRecorded:0};

            occurrenceCountDTO.some(it => {
                if (it.additional.taxonGuid === taxonGuid) {
                    result = {
                        count:it.count,
                        lastRecorded:it.year
                    };
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

    var places = function (layerId) {
    	return new Places(layerId);
    };

    /**
     * @classdesc Represents the Beautiful Burial Grounds SDK.
     * @memberof NBNAtlas
     */
    class BBG {

        constructor() {
            this.places = new Places(LAYERS.BEAUTIFUL_BURIAL_GROUNDS);
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


    const bbg = new BBG();

    exports.BBG = BBG;
    exports.CONFIG = CONFIG;
    exports.LAYERS = LAYERS;
    exports.Places = Places;
    exports.SPECIES_LIST = SPECIES_LIST;
    exports.bbg = bbg;
    exports.places = places;

    Object.defineProperty(exports, '__esModule', { value: true });

    var oldNBNAtlas = window.NBNAtlas;
    exports.noConflict = function() {
    	window.NBNAtlas = oldNBNAtlas;
    	return this;
    }

    /** @namespace NBNAtlas*/
    window.NBNAtlas = exports;

})));
