// Test geo.canvas.gridFeature

describe('canvas grid feature', function () {
  var geo = require('../test-utils').geo;
  var $ = require('jquery');

  beforeEach(function () {
    $('<div id="map-canvas-grid-feature"/>')
      .css({width: '500px', height: '400px'}).appendTo('body');
  });

  afterEach(function () {
    $('#map-canvas-grid-feature').remove();
  });

  describe('canvas grid feature', function () {
    'use strict';

    var mockAnimationFrame = require('../test-utils').mockAnimationFrame;
    var stepAnimationFrame = require('../test-utils').stepAnimationFrame;
    var unmockAnimationFrame = require('../test-utils').unmockAnimationFrame;

    var map, layer, grid1, width = 800, height = 600;
    var clock;
    beforeEach(function () {
      clock = sinon.useFakeTimers();
    });
    afterEach(function () {
      clock.restore();
    });

    it('Setup map', function () {
      mockAnimationFrame();
      map = geo.map({node: '#map-canvas-grid-feature', center: [0, 0], zoom: 3});
      layer = map.createLayer('feature', {'renderer': 'canvas'});
      map.resize(0, 0, width, height);
    });

    it('Add feature to a layer', function () {
      var grid_data = [10, 29, 39, 45, 23, 99, 40, 69, 99];

      grid1 = layer.createFeature('grid')
              .data(grid_data)
              .intensity(function (d) {
                return d[0];
              })
              .maxIntensity(100)
              .minIntensity(0)
              .upperLeft({x: 0, y: 0})
              .cellSize(1)
              .rowCount(3)
              .updateDelay(0);

      map.draw();
      stepAnimationFrame(new Date().getTime());
      expect(layer.children().length).toBe(1);
    });

    it('_animatePan', function () {
      map.draw();
      var buildTime = grid1.buildTime().getMTime();
      map.pan({x: 1, y: 0});
      expect(grid1.buildTime().getMTime()).toBe(buildTime);
      clock.tick(50);
      map.pan({x: 0, y: 0});
      expect(grid1.buildTime().getMTime()).not.toBe(buildTime);
    });

    it('Validate coords', function () {
      expect(grid1.upperLeft().x).toBe(0);
      expect(grid1.upperLeft().y).toBe(0);
    });

    it('Set coords', function () {
      grid1.upperLeft({x: -140.0, y: 45.0});
      expect(grid1.upperLeft().x).toBe(-140.0);
      expect(grid1.upperLeft().y).toBe(45.0);
    });

    it('Validate gcsPosition', function () {
      expect(grid1.gcsPosition().x).toBe(-15584728.711058298);
      expect(grid1.gcsPosition().y).toBe(5621521.486192066);
    });

    it('Validate cellsize', function () {
      expect(grid1.cellSize()).toBe(1);
    });

    it('Set cellsize', function () {
      grid1.cellSize(2);
      expect(grid1.cellSize()).toBe(2);
    });

    it('Validate maximum intensity', function () {
      expect(grid1.maxIntensity()).toBe(100.0);
    });

    it('Set maximum intensity', function () {
      grid1.maxIntensity(99.99);
      expect(grid1.maxIntensity()).toBe(99.99);
    });

    it('Validate minimum intensity', function () {
      expect(grid1.minIntensity()).toBe(0.0);
    });

    it('Validate maximum intensity', function () {
      grid1.minIntensity(0.01);
      expect(grid1.minIntensity()).toBe(0.01);
    });

    it('Validate rowcount', function () {
      expect(grid1.rowCount()).toBe(3);
    });

    it('Set rowcount', function () {
      grid1.rowCount(5);
      expect(grid1.rowCount()).toBe(5);
    });

    it('Validate updateDelay', function () {
      expect(grid1.updateDelay()).toBe(0);
    });

    it('Set updateDelay', function () {
      grid1.updateDelay(60);
      expect(grid1.updateDelay()).toBe(60);
    });

    it('Compute gradient', function () {
      expect(layer.node()[0].children[0].getContext('2d')
        .getImageData(1, 0, 1, 1).data.length).toBe(4);
    });

    it('Remove a feature from a layer', function () {
      layer.deleteFeature(grid1).draw();
      expect(layer.children().length).toBe(0);
      // stop mocking animation frames
      unmockAnimationFrame();
    });

    it('Check autogenerated min/max intensities', function () {
      var grid_data = [10, 29, 39, 45, 23, 99, 40, 69, 99];

      var layer2 = map.createLayer('feature');
      var grid2 = layer2.createFeature('grid')
        .data(grid_data)
        .intensity(function (d) {
          return d;
        })
        .upperLeft({x: 0, y: 0})
        .cellSize(1)
        .rowCount(3)
        .updateDelay(0);

      grid2._build();
      expect(grid2.minIntensity()).toBe(10);
      expect(grid2.maxIntensity()).toBe(99);
    });

  });
});