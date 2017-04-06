function Slide(properties) {
  this.id = null;
  this.credit = '';
  this.type = '';
  this.image_type = '';
  this.metadata = {
    'template': {},
    'video-source': null
  };
  this.published = '';
  this.title = '';
  this.caption = '';
  this.image_url_large = '';
  this.image_url_thumb = '';
  this.image = '';
  this.bumper = false;
  this.template = {};
  Object.keys(properties).forEach((key) => {
    this[key] = properties[key];
  });
}

module.exports = Slide;
