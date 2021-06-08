/* @preserve
 * A JS SDK for NBN Atlas. https://nbnatlas.org/
 * Author: Helen Manders-Jones helenmandersjones@gmail.com
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).NBNAtlas={})}(this,(function(e){"use strict";async function t(e){const t=new AbortController;setTimeout((()=>t.abort()),1e4);const s=await fetch(e,{signal:t.signal});if(s.status>=400)return Promise.reject({status:s.status,message:s.statusText,body:s.data});if(s.status>=200&&s.status<=202){return await s.json()}return{}}const s={URL_RECORDS_WS:"https://records-ws.nbnatlas.org",URL_SPECIES_WS:"https://species-ws.nbnatlas.org",URL_LISTS_WS:"https://lists.nbnatlas.org",SENSITIVE_IN_WALES_JSON:"https://cdn.nbnatlas.org/sensitive_species_wales.json",SENSITIVE_IN_ENGLAND_JSON:"https://cdn.nbnatlas.org/sensitive_species_england.json"},n={BEAUTIFUL_BURIAL_GROUNDS:"cl273"},i={BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE:"dr2504",BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE:"dr2492"};class c{async getBBGPlace(e){let t=this._buildGetPlaceUrl(e),s=await this._getJson(t);return this._buildBBGPlaceDTO(s)}_buildBBGPlaceDTO(e){let t=e.searchResults&&e.searchResults.results&&e.searchResults.results[0]?e.searchResults.results[0]:null;return t?{assetID:t.bbg_unique_s,name:t.bbg_name_s}:[]}_buildGetPlaceUrl(e){return`${s.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=name:${encodeURIComponent('"'+e+'"')}`}_getJson(e){return t(e)}}const a="Missing place name",r="Missing species list id";function u(e){return Promise.reject({status:"INVALID",message:e})}class o{async getSpeciesCountByGroup({layerId:e,placeName:t}){let n=`${s.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${e}:${encodeURIComponent('"'+t+'"')}&fq=-occurrence_status:absent`,i=await this._getJson(n);return this._buildSpeciesCountByGroupDTO(i)}async getSpeciesCountByGroupForSpeciesList({layerId:e,placeName:t,speciesListId:n}){let i=`${s.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${e}:${encodeURIComponent('"'+t+'"')}&fq=-occurrence_status:absent`;i=`${i}&fq=species_list_uid:${n}`;let c=await this._getJson(i);return this._buildSpeciesCountByGroupDTO(c)}async getOccurrenceCount({layerId:e,placeName:t}){const n=`${s.URL_RECORDS_WS}/occurrences/search?q=${e}:${encodeURIComponent('"'+t+'"')}&facets=names_and_lsid&pageSize=0&flimit=-1`,i=await this._getJson(n);return this._buildOccurrenceCountDTO(i)}async getOccurrenceCountForSpeciesList({layerId:e,placeName:t,speciesListId:n}){const i=`${s.URL_RECORDS_WS}/occurrences/search?q=${e}:${encodeURIComponent('"'+t+'"')}&facets=names_and_lsid&pageSize=0&flimit=-1&fq=-occurrence_status:absent&fq=species_list_uid:${n}`,c=await this._getJson(i);return this._buildOccurrenceCountDTO(c)}_buildSpeciesCountByGroupDTO(e){return e}_buildOccurrenceCountDTO(e){return e.facetResults&&e.facetResults[0]&&e.facetResults[0].fieldResult?e.facetResults[0].fieldResult.map((e=>{const t=e.label.split("|");return{...e,additional:{scientificName:t[0],commonName:t[2],taxonGuid:t[1]}}})):[]}_getJson(e){return t(e)}}class l{async getSpeciesList(e){let n=`${s.URL_LISTS_WS}/ws/speciesListItems/${e}`,i=await t(n);return this._buildSpeciesListDTO(i)}_buildSpeciesListDTO(e){return e}}class p{constructor(e){this.layerId=e,this.recordsWS=new o,this.listsWS=new l}async getSpeciesCountByGroup(e,t){if(!e)return u(a);const s=await this.recordsWS.getSpeciesCountByGroup({layerId:this.layerId,placeName:e});let n=t?await this.recordsWS.getSpeciesCountByGroupForSpeciesList({layerId:this.layerId,placeName:e,speciesListId:t}):[];return this._buildSpeciesCountByGroupResult(s,n)}async getOccurrenceCount(e){if(!e)return u(a);let n=[];const i=await this.recordsWS.getOccurrenceCount({layerId:this.layerId,placeName:e});if(i){const e=await t(s.SENSITIVE_IN_WALES_JSON),c=await t(s.SENSITIVE_IN_ENGLAND_JSON);n=this._buildOccurrenceCountResult(i,e,c)}return n}async getOccurrenceCountForSpeciesList(e,n){if(!e)return u(a);if(!n)return u(r);const i=await this.listsWS.getSpeciesList(n);let c=[];const o=await this.recordsWS.getOccurrenceCountForSpeciesList({layerId:this.layerId,placeName:e,speciesListId:n});if(o){const e=await t(s.SENSITIVE_IN_WALES_JSON),n=await t(s.SENSITIVE_IN_ENGLAND_JSON);c=this._buildOccurrenceCountForSpeciesListResult(i,o,e,n)}return c}_buildSpeciesCountByGroupResult(e,t){const s=new Map;return e.forEach((e=>s.set(e.name,{speciesGroup:e.name,speciesCount:e.speciesCount,selectedSpeciesCount:0}))),t.forEach((e=>{let t=s.get(e.name);t?t={...t,selectedSpeciesCount:e.speciesCount}:s.set(e.name,{speciesGroup:e.name,speciesCount:0,selectedSpeciesCount:e.speciesCount})})),[...s.values()]}_buildOccurrenceCountResult(e,t,s){if(!e)return{};const n=this._sensitiveSpeciesJSONToMap(t),i=this._sensitiveSpeciesJSONToMap(s);return e.map((e=>({scientificName:e.additional.scientificName,commonName:e.additional.commonName,taxonGuid:e.additional.taxonGuid,count:e.count,sensitiveInEngland:!!n[e.additional.taxonGuid],sensitiveInWales:!!i[e.additional.taxonGuid]})))}_buildOccurrenceCountForSpeciesListResult(e,t,s,n){if(!t)return{};const i=this._sensitiveSpeciesJSONToMap(s),c=this._sensitiveSpeciesJSONToMap(n);return e.map((e=>({scientificName:e.scientificName,commonName:e.commonName,taxonGuid:e.lsid,count:this._getOccurrenceCount(e.lsid,t),sensitiveInEngland:!!i[e.lsid],sensitiveInWales:!!c[e.lsid]})))}_getOccurrenceCount(e,t){let s=0;return t.some((t=>t.additional.taxonGuid===e&&(s=t.count,!0))),s}_sensitiveSpeciesJSONToMap(e){return e.reduce(((e,t)=>(e[t.guid]=t,e)),{})}}class _{constructor(){this.places=new p(n.BEAUTIFUL_BURIAL_GROUNDS),this.speciesWS=new c}async getSeekAdviceData(e){return this.places.getOccurrenceCountForSpeciesList(e,i.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE)}async getDigestTableData(e){return this.places.getSpeciesCountByGroup(e,i.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE)}async getPlace(e){return e?await this.speciesWS.getBBGPlace(e):u(a)}}const d=new _;e.BBG=_,e.CONFIG=s,e.LAYERS=n,e.Places=p,e.SPECIES_LIST=i,e.bbg=d,e.places=function(e){return new p(e)},Object.defineProperty(e,"__esModule",{value:!0});var S=window.NBNAtlas;e.noConflict=function(){return window.NBNAtlas=S,this},window.NBNAtlas=e}));
//# sourceMappingURL=nbnatlas-sdk.js.map
