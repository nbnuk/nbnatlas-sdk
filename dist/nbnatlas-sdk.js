/* @preserve
 * A JS SDK for NBN Atlas. https://nbnatlas.org/
 * Author: Helen Manders-Jones helenmandersjones@gmail.com
 */
!function(e,s){"object"==typeof exports&&"undefined"!=typeof module?s(exports):"function"==typeof define&&define.amd?define(["exports"],s):s((e=e||self).NBNAtlas={})}(this,(function(e){"use strict";async function s(e){const s=new AbortController;setTimeout((()=>s.abort()),1e4);const t=await fetch(e,{signal:s.signal});if(t.status>=400)return Promise.reject({status:t.status,message:t.statusText,body:t.data});if(t.status>=200&&t.status<=202){return await t.json()}return{}}function t(e,s=" OR "){return e.map((e=>encodeURIComponent('"'+e+'"'))).join("OR")}const i={URL_RECORDS_WS:"https://records-ws.nbnatlas.org",URL_SPECIES_WS:"https://species-ws-dev.nbnatlas.org",URL_LISTS_WS:"https://lists.nbnatlas.org"},c={BEAUTIFUL_BURIAL_GROUNDS:"cl273"},n={BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE:"dr2504",BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE:"dr2492",SENSITIVE_IN_ENGLAND:"dr2058",SENSITIVE_IN_WALES:"dr2067"};class r{async getBBGPlace(e){let s=this._buildGetPlaceUrl(e),t=await this._getJson(s);return this._buildBBGPlaceDTO(t)}async getBBGPlacesForAssetID(e){let s=`${i.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=assetid_s:${e}`,t=await this._getJson(s);return this._buildBBGAssetDTO(t)}_buildBBGPlaceDTO(e){let s=e.searchResults&&e.searchResults.results&&e.searchResults.results[0]?e.searchResults.results[0]:null;return s?{assetID:s.assetid_s,name:s.bbg_name_s}:[]}_buildBBGAssetDTO(e){let s=e.searchResults&&e.searchResults.results&&e.searchResults.results.length>0?e.searchResults.results:null;return s?{assetID:s[0].assetid_s,assetName:s[0].name_s,places:s.map((e=>e.bbg_name_s))}:{}}_buildGetPlaceUrl(e){return`${i.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=name:${encodeURIComponent('"'+e+'"')}`}_getJson(e){return s(e)}}const a="Missing place name",u="Missing species list id",o="Missing asset id";function l(e){return Promise.reject({status:"INVALID",message:e})}class d{async getSpeciesCountByGroup({layerId:e,placeNames:s}){let c=`${i.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${e}:(${t(s)})&fq=-occurrence_status:absent`,n=await this._getJson(c);return this._buildSpeciesCountByGroupDTO(n)}async getSpeciesCountByGroupForSpeciesList({layerId:e,placeNames:s,speciesListId:c}){let n=`${i.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${e}:(${t(s)})&fq=-occurrence_status:absent`;n=`${n}&fq=species_list_uid:${c}`;let r=await this._getJson(n);return this._buildSpeciesCountByGroupDTO(r)}async getOccurrenceCount({layerId:e,placeNames:s}){const c=`${i.URL_RECORDS_WS}/occurrences/search?q=${e}:(${t(s)})&facets=names_and_lsid&pageSize=1&flimit=-1\n                                &fq=-occurrence_status:absent&sort=year&dir=desc&fl=year`,n=await this._getJson(c);return this._buildOccurrenceCountDTO(n)}async getOccurrenceCountForSpeciesList({layerId:e,placeNames:s,speciesListId:c}){const n=`${i.URL_RECORDS_WS}/occurrences/search?q=${e}:(${t(s)})&facets=names_and_lsid&pageSize=1&flimit=-1\n                            &fq=-occurrence_status:absent&fq=species_list_uid:${c}&sort=year&dir=desc&fl=year`,r=await this._getJson(n);return this._buildOccurrenceCountDTO(r)}_buildSpeciesCountByGroupDTO(e){return e}_buildOccurrenceCountDTO(e){let s=e.occurrences&&e.occurrences[0]&&e.occurrences[0].year?e.occurrences[0].year:0;return e.facetResults&&e.facetResults[0]&&e.facetResults[0].fieldResult?e.facetResults[0].fieldResult.map((e=>{const t=e.label.split("|");return{...e,year:s,additional:{scientificName:t[0],commonName:t[2],taxonGuid:t[1]}}})):[]}_getJson(e){return s(e)}}class p{async getSpeciesList(e){let t=`${i.URL_LISTS_WS}/ws/speciesListItems/${e}`,c=await s(t);return this._buildSpeciesListDTO(c)}_buildSpeciesListDTO(e){return e}}class S{constructor(e){this.layerId=e,this.recordsWS=new d,this.listsWS=new p}async getSpeciesCountByGroup(e,s){if(!e||!e.length)return l(a);const t=await this.recordsWS.getSpeciesCountByGroup({layerId:this.layerId,placeNames:e});let i=s?await this.recordsWS.getSpeciesCountByGroupForSpeciesList({layerId:this.layerId,placeNames:e,speciesListId:s}):[];return this._buildSpeciesCountByGroupResult(t,i)}async getOccurrenceCount(e){if(!e)return l(a);let s=[];const t=await this.recordsWS.getOccurrenceCount({layerId:this.layerId,placeNames:e});if(t){const e=await this.listsWS.getSpeciesList(n.SENSITIVE_IN_WALES),i=await this.listsWS.getSpeciesList(n.SENSITIVE_IN_ENGLAND);s=this._buildOccurrenceCountResult(t,e,i)}return s}async getOccurrenceCountForSpeciesList(e,s){if(!e)return l(a);if(!s)return l(u);const t=await this.listsWS.getSpeciesList(s);let i=[];const c=await this.recordsWS.getOccurrenceCountForSpeciesList({layerId:this.layerId,placeNames:e,speciesListId:s});if(c){const e=await this.listsWS.getSpeciesList(n.SENSITIVE_IN_WALES),s=await this.listsWS.getSpeciesList(n.SENSITIVE_IN_ENGLAND);i=this._buildOccurrenceCountForSpeciesListResult(t,c,e,s)}return i}_buildSpeciesCountByGroupResult(e,s){const t=new Map;return e.forEach((e=>t.set(e.name,{speciesGroup:e.name,speciesCount:e.speciesCount,selectedSpeciesCount:0}))),s.forEach((e=>{let s=t.get(e.name);s?s={...s,selectedSpeciesCount:e.speciesCount}:t.set(e.name,{speciesGroup:e.name,speciesCount:0,selectedSpeciesCount:e.speciesCount})})),[...t.values()]}_buildOccurrenceCountResult(e,s,t){if(!e)return{};const i=this._sensitiveSpeciesJSONToMap(s),c=this._sensitiveSpeciesJSONToMap(t);return e.map((e=>({scientificName:e.additional.scientificName,commonName:e.additional.commonName,taxonGuid:e.additional.taxonGuid,count:e.count,sensitiveInEngland:!!i[e.additional.taxonGuid],sensitiveInWales:!!c[e.additional.taxonGuid]})))}_buildOccurrenceCountForSpeciesListResult(e,s,t,i){if(!s)return{};const c=this._sensitiveSpeciesJSONToMap(t),n=this._sensitiveSpeciesJSONToMap(i);return e.map((e=>{let t=this._getOccurrenceCountAndLastRecorded(e.lsid,s);return{scientificName:e.scientificName,commonName:e.commonName,taxonGuid:e.lsid,lastRecorded:t.lastRecorded,count:t.count,sensitiveInEngland:!!c[e.lsid],sensitiveInWales:!!n[e.lsid]}}))}_getOccurrenceCountAndLastRecorded(e,s){let t={count:0,lastRecorded:0};return s.some((s=>s.additional.taxonGuid===e&&(t={count:s.count,lastRecorded:s.year},!0))),t}_sensitiveSpeciesJSONToMap(e){return e.reduce(((e,s)=>(e[s.lsid]=s,e)),{})}}class _{constructor(){this.places=new S(c.BEAUTIFUL_BURIAL_GROUNDS),this.speciesWS=new r}async getSeekAdviceData(e){return e?this.places.getOccurrenceCountForSpeciesList([e],n.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE):l(a)}async getSeekAdviceDataForAssetID(e){if(!e)return l(o);let s=await this.speciesWS.getBBGPlacesForAssetID(e);return this.places.getOccurrenceCountForSpeciesList(s.places,n.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE)}async getDigestTableData(e){return e?this.places.getSpeciesCountByGroup([e],n.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE):l(a)}async getDigestTableDataForAssetID(e){if(!e)return l(o);let s=await this.speciesWS.getBBGPlacesForAssetID(e);return this.places.getSpeciesCountByGroup(s.places,n.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE)}async getPlace(e){return e?this.speciesWS.getBBGPlace(e):l(a)}}const I=new _;e.BBG=_,e.CONFIG=i,e.LAYERS=c,e.Places=S,e.SPECIES_LIST=n,e.bbg=I,e.places=function(e){return new S(e)},Object.defineProperty(e,"__esModule",{value:!0});var R=window.NBNAtlas;e.noConflict=function(){return window.NBNAtlas=R,this},window.NBNAtlas=e}));
//# sourceMappingURL=nbnatlas-sdk.js.map
