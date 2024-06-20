import { use } from 'chai'
import chaiHttp from 'chai-http'
import chai from 'chai';

chai.use(chaiHttp);

let request  = null

const get_request = () => {
    if (!request) {
        request  = use(chaiHttp).request.execute
    }
    return request
}

// in test_ui.mjs (and other modules that need to use chai-http):

import {expect} from 'chai'
import {get_request } from '../util/get_request.mjs'
const requests = get_request()

