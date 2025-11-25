function ModelExtractorExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

ModelExtractorExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ModelExtractorExtension.prototype.constructor = ModelExtractorExtension;

ModelExtractorExtension.prototype.onLoadedEvent = function () {
  console.log('ModelExtractorExtension: Model loaded');
  let isFirstLoad = document.getElementById('isFirstLoad').textContent === 'true';
  if (isFirstLoad) {
    console.log('ModelExtractorExtension: This is the first load of the model.');
  } else {
    console.log('ModelExtractorExtension: This is NOT the first load of the model.');
  }
};

ModelExtractorExtension.prototype.load = function () {
  this.onLoadedBinded = this.onLoadedEvent.bind(this);
  this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.onLoadedBinded);
  return true;
};

ModelExtractorExtension.prototype.unload = function () {
  this.viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.onLoadedBinded);
  this.onLoadedBinded = null;
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('ModelExtractorExtension', ModelExtractorExtension);