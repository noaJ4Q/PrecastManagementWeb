function ModelExtractorExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

ModelExtractorExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ModelExtractorExtension.prototype.constructor = ModelExtractorExtension;

ModelExtractorExtension.prototype.onLoadedEvent = function () {
  console.log('ModelExtractorExtension: Model loaded');
  const isFirstLoad = document.getElementById('isFirstLoad').textContent === 'true';
  if (isFirstLoad) {
    console.log('ModelExtractorExtension: This is the first load of the model.');
  } else {
    console.log('ModelExtractorExtension: This is NOT the first load of the model.');

    // Extract model elements
    const model = this.viewer.model;
    const tree = model.getInstanceTree();
    const rootId = tree.getRootId();
    const elementsIds = [];

    tree.enumNodeChildren(rootId, (dbId) => {
      elementsIds.push(dbId);
    }, true);

    console.log(`ModelExtractorExtension: Extracted ${elementsIds.length} `);

    const propFilter = [
      'Category',
      'Type Name',
      'Description',
      'Location Line',
      'Length',
      'Width'
    ];

    model.getBulkProperties(elementsIds, propFilter, function (results) {

      const physicalCategories = [
        'Columns',
        // 'Floors',
        'Walls',
        // 'Roofs',
        // 'Stairs',
      ];

      const notIncludedCategories = [
        'Curtain'
      ];

      const noFamilyKeywords = [
        'SH_Curtain'
      ]

      let filteredElements = results.filter(item => {
        const categoryProp = item.properties.find(p => p.displayName === 'Category');
        const familyProp = item.properties.find(p => p.displayName === 'Type Name');

        return categoryProp && familyProp &&
          physicalCategories.some(value => categoryProp.displayValue.includes(value)) &&
          !notIncludedCategories.some(value => categoryProp.displayValue.includes(value)) &&
          !noFamilyKeywords.some(value => familyProp.displayValue.includes(value));
      }).map(item => {
        const properties = {};
        item.properties.forEach(prop => {
          properties[prop.displayName] = prop.displayValue;
        });

        return {
          dbId: item.dbId,
          name: item.name,
          category: properties['Category'] || 'Unknown',
          type: properties['Type Name'] || 'Unknown',
          description: properties['Description'] || 'Unknown',
          location: properties['Location Line'] || 'Unknown',
          length: properties['Length'] || 'Unknown',
          width: properties['Width'] || 'Unknown'
        }
      });

      filteredElements = filteredElements.slice(20, 25); // For testing, limit to 5 elements

      console.log(`ModelExtractorExtension: Filtered down to ${filteredElements.length} physical elements.`);

      // Save elements to Firestore
      try {
        fetch('/api/components/elements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ elements: filteredElements })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
          })
          .then(data => {
            console.log('ModelExtractorExtension: Successfully saved elements to Firestore.', data);
          })
          .catch(error => {
            console.error('ModelExtractorExtension: Error saving elements to Firestore:', error);
          });
      } catch (err) {
        console.error('ModelExtractorExtension: Exception while saving elements to Firestore:', err);
      }

    })
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