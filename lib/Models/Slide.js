const isPlainObject = require('is-plain-object');

function isArray(value) {
    return !!value && value.constructor === Array && value.length === 0;
}

function Slide(properties = {}) {
    this.id = null;
    this.credit = '';
    this.type = '';
    this.image_type = '';
    this.data = {
        duration: null,
        slideType: 'image',
        slideTemplate: null,
        video: {},
        image: {},
        bumper: 0,
        transition: 0,
        textAlignment: 7,
        crop: null
    };
    this.published = '';
    this.title = '';
    this.caption = '';
    this.image_url_large = '';
    this.image_url_thumb = '';
    this.image = '';

    var local;
    var remote;
    Object.keys(properties).forEach((key) => {
        if (properties[key]) {
            local = this[key];
            remote = properties[key];
            if (remote && key === 'data') {
                Object.keys(remote).forEach((dataKey) => {
                    // Prevent api from returning empty arrays
                    this.data[dataKey] = (isArray(remote[dataKey]) && remote[dataKey].length === 0) ? local[dataKey] : remote[dataKey];
                });
            } else {
                this[key] = isPlainObject(remote) ? Object.assign(local, remote) : remote;
            }
        }
    });
}

module.exports = Slide;
