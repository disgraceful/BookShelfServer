import "dotenv/config"
import axios from "axios";
import converter from "xml-js";
import { ErrorWithHttpCode } from "../../error/ErrorWithHttpCode";

const dev_key = process.env.GOODREADS_KEY;
const root = "https://www.goodreads.com/";
const abeBooksUrl = "https://pictures.abebooks.com/isbn/";
const defaultImgUrl = "https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png";

class GoodreadsBaseService {
    get root() {
        return root;
    }

    get devKey() {
        return dev_key;
    }

    async getValueFromGoodreads(url) {
        try {
            const response = await axios.get(url);
            if (response.status >= 300) {
                throw new ErrorWithHttpCode(response.status, response.body.message)
            }
            const xml = response.data;
            const converted = converter.xml2js(xml, { compact: true });
            return converted;
        }
        catch (error) {
            throw new ErrorWithHttpCode(500, error.message);
        }
    }

    async formatImageUrl(url, isbn) {
        let imageUrl = "";
        if (url.includes("nophoto") && isbn) {
            imageUrl = `${abeBooksUrl}${isbn}.jpg`;
            try {
                const response = await axios.get(imageUrl);
                if (response.status !== 404) {
                    return imageUrl;
                }
            } catch (error) {
                return defaultImgUrl;
            }
        }
        return url;
    }

    findValue(object, search) {
        let result;
        Object.keys(object).some(key => {
            if (key === search) {
                result = object[key];
                return true;
            }
            if (object[key] && typeof object[key] === "object") {
                result = this.findValue(object[key], search);
                return result !== undefined;
            }
        });
        return result;
    }
}

export default GoodreadsBaseService;
