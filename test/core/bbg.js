import sinon from 'sinon';
import { expect, assert } from 'chai'
import { SPECIES_LIST } from '../../src/config/index'
import { BBG } from '../../src/core/bbg'
import {ERROR_MESSAGES} from '../../src/validation/index'


let bbg;

describe('bbg', function () {
    before(function () {
        bbg = new BBG();
    });

    describe('getPlace(placeName)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_PLACE_NAME', async function () {
                try {
                    await bbg.getPlace();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID")
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_PLACE_NAME)
                }

            })
        })

        context('with placeName argument', function () {
            it('should call correct webservice', async function () {
                const speciesWSStub = sinon.stub(bbg.speciesWS, "getBBGPlace");
                await bbg.getPlace("place");
                sinon.assert.calledWith(speciesWSStub,"place");
                speciesWSStub.restore();          
            })
        })


    });

    describe('getDigestTableData(placeName)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_PLACE_NAME', async function () {
                try {
                    await bbg.getDigestTableData();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID");
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_PLACE_NAME)
                }

            })
        })

        context('with placeName argument', function () {
            it('should call correct web service', async function () {
                const stub = sinon.stub(bbg.places, "getSpeciesCountByGroup");
                await bbg.getDigestTableData("place");
                sinon.assert.calledWith(stub,"place", SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE);
                stub.restore();       
            })
        })


    });


    describe('getSeekAdviceData(placeName)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_PLACE_NAME', async function () {
                try {
                    await bbg.getSeekAdviceData();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID")
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_PLACE_NAME)
                }

            })
        })

        context('with placeName argument', function () {
            it('should call correct web service', async function () {
                const stub = sinon.stub(bbg.places, "getOccurrenceCountForSpeciesList");
                await bbg.getSeekAdviceData("place");
                sinon.assert.calledWith(stub,"place", SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE);               
                stub.restore();       
            })
        })


    });


    

});