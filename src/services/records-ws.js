import { getJson } from '../util/index'
import { CONFIG } from '../config/index'

/**
* @private
*/
export class RecordsWS {


    async getSpeciesCountByGroup({layerId, placeName}) {
        let url = `${CONFIG.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${layerId}:${encodeURIComponent('"' + placeName + '"')}&fq=-occurrence_status:absent`;
        let json = await this._getJson(url);
        return this._buildSpeciesCountByGroupDTO(json);
    }

    async getSpeciesCountByGroupForSpeciesList({layerId, placeName, speciesListId}) {
        let url = `${CONFIG.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${layerId}:${encodeURIComponent('"' + placeName + '"')}&fq=-occurrence_status:absent`;
        url = `${url}&fq=species_list_uid:${speciesListId}`;
        let json = await this._getJson(url);
        return this._buildSpeciesCountByGroupDTO(json);
    }

    async getOccurrenceCount({layerId, placeName}) {
        const url = `${CONFIG.URL_RECORDS_WS}/occurrences/search?q=${layerId}:${encodeURIComponent('"' + placeName + '"')}&facets=names_and_lsid&pageSize=0&flimit=-1`;
        const json = await this._getJson(url);
        return this._buildOccurrenceCountDTO(json)
    }

    async getOccurrenceCountForSpeciesList({layerId, placeName, speciesListId}) {
        const url = `${CONFIG.URL_RECORDS_WS}/occurrences/search?q=${layerId}:${encodeURIComponent('"' + placeName + '"')}&facets=names_and_lsid&pageSize=0&flimit=-1&fq=-occurrence_status:absent&fq=species_list_uid:${speciesListId}`;
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
        let result = json.facetResults && json.facetResults[0] && json.facetResults[0].fieldResult ?
            json.facetResults[0].fieldResult.map(it => {
                const label = it.label.split('|');
                return {
                    ...it,
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