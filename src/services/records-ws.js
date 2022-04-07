import { getJson, encodeAndJoin } from '../util/index.js'
import { CONFIG } from '../config/index.js'

/**
* @private
*/
export class RecordsWS {


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