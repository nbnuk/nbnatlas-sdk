import { getJson } from '../util/index'
import { CONFIG } from '../config/index'

/**
* @private
*/
export class SpeciesWS {

    async getBBGPlace(placeName) {
        let url = this._buildGetPlaceUrl(placeName);
        let json = await this._getJson(url);
        return this._buildBBGPlaceDTO(json);
    }



    /**
      * @private
      */
    _buildBBGPlaceDTO(json) {
        //let result = json.searchResults?.results?.[0];
        let result = json.searchResults && json.searchResults.results && json.searchResults.results[0] ?
            json.searchResults.results[0] : null;
        return result ? {
            assetID: result.bbg_unique_s,
            name: result.bbg_name_s
        }
            : [];
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

