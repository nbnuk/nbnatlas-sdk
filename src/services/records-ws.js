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
        const occurrenceCountDTO = this._buildOccurrenceCountDTO(json);
        if (occurrenceCountDTO.length) {
            await this._addLastOccurrenceYear({layerId, placeNames, speciesListId: undefined, occurrenceCountDTO})
            const batCount = await this._getBatOccurrenceCount({layerId, placeNames})
            occurrenceCountDTO.push(batCount);
        }

        return occurrenceCountDTO;
    }

    async getOccurrenceCountForSpeciesList({layerId, placeNames, speciesListId}) {
        const url = `${CONFIG.URL_RECORDS_WS}/occurrences/search?q=${layerId}:(${encodeAndJoin(placeNames)})&facets=names_and_lsid&pageSize=1&flimit=-1
                            &fq=-occurrence_status:absent&fq=species_list_uid:${speciesListId}&sort=year&dir=desc&fl=year`;

        const json = await this._getJson(url);
        const occurrenceCountDTO = this._buildOccurrenceCountDTO(json)
        if (occurrenceCountDTO.length) {
            await this._addLastOccurrenceYear({layerId, placeNames, speciesListId, occurrenceCountDTO})
            const batCount = await this._getBatOccurrenceCount({layerId, placeNames})
            occurrenceCountDTO.push(batCount);
        }

        return occurrenceCountDTO;
    }

    async _getBatOccurrenceCount({layerId, placeNames}) {
        const url =`${CONFIG.URL_RECORDS_WS}/occurrences/search?q=${layerId}:(${encodeAndJoin(placeNames)})&fq=lsid:NHMSYS0000376160
                            &fq=occurrence_status:present&pageSize=1&sort=year&dir=desc`;
        const json = await this._getJson(url);

        const occurrenceCountDTO = json.occurrences.length ?  {
            count:json.totalRecords,
            year:json.occurrences[0].year,
            additional: {
                scientificName: "Chiroptera",
                commonName: "Bat",
                taxonGuid: "NHMSYS0020001355"
            }} : {
            count:0,
            year:0,
            additional: {
                scientificName: "Chiroptera",
                commonName: "Bat",
                taxonGuid: "NHMSYS0020001355"
            }};
        return occurrenceCountDTO;
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
        // let year = json.occurrences && json.occurrences[0] && json.occurrences[0].year ? json.occurrences[0].year:0;
        const result = json.facetResults && json.facetResults[0] && json.facetResults[0].fieldResult ?
            json.facetResults[0].fieldResult.map(it => {
                const label = it.label.split('|');
                return {
                    ...it,
                    year:0, //this will be calculated later
                    additional: {
                        scientificName: label[0],
                        commonName: label[2],
                        taxonGuid: label[1]
                    }
                };
            }) : [];

        return result;
    }


    /**
     * @private
     */
    async _addLastOccurrenceYear({layerId, placeNames, speciesListId, occurrenceCountDTO}) {
       // const totalCount = occurrenceCountDTO.reduce((acc, cur) => acc + cur.count, 0);
            const taxnConceptGuids = "("+occurrenceCountDTO.map(item => item.additional.taxonGuid).join(' OR ')+")";

            const url = `${CONFIG.URL_RECORDS_WS}/occurrences/search?q=${layerId}:(${encodeAndJoin(placeNames)})&pageSize=20000
                                &fq=-occurrence_status:absent&fq=taxon_concept_lsid:${taxnConceptGuids}&sort=year&dir=desc&fl=year,taxon_concept_lsid`
            + (speciesListId ? `&fq=species_list_uid:${speciesListId}` : '');

            const json = await this._getJson(url);


            const taxonConcepts = Object.values(json.occurrences.reduce((acc, cur) => {
                const { taxonConceptID, year } = cur;
                if (!acc[taxonConceptID] || year > acc[taxonConceptID].year) {
                    acc[taxonConceptID] = { taxonConceptID, year };
                }
                return acc;
            }, {}));


        occurrenceCountDTO.forEach(item => {
            const matchingConcept = taxonConcepts.find(concept => concept.taxonConceptID === item.additional.taxonGuid);
            if (matchingConcept) {
                item.year = matchingConcept.year;
            }
        })
        return occurrenceCountDTO;
    }

    /** @private */
    _getJson(url) {
        return getJson(url)
    }
}