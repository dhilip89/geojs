//////////////////////////////////////////////////////////////////////////////
/**
 * @module ggl
 */

/*jslint devel: true, forin: true, newcap: true, plusplus: true*/
/*jslint white: true, continue:true, indent: 2*/

/*global window, ggl, ogs, vec4, inherit, $*/
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
/**
 * Create a new instance of class simpleRenderer
 *
 * @param canvas
 * @returns {ggl.simpleRenderer}
 */
//////////////////////////////////////////////////////////////////////////////
ggl.simpleRenderer = function(container, canvas) {
  'use strict';

  if (!(this instanceof ggl.simpleRenderer)) {
    return new ggl.simpleRenderer(container, canvas);
  }
  geo.renderer.call(this, container, canvas);

  var m_this = this,
      m_canvas = canvas,
      m_viewer = null,
      s_init = this._init;

  ////////////////////////////////////////////////////////////////////////////
  /**
   * Initialize
   */
  ////////////////////////////////////////////////////////////////////////////
  this._init = function() {
    s_init();

    if (!m_canvas) {
      m_canvas = $(document.createElement('canvas'));
      m_canvas.attr('class', '.webgl-canvas');
      m_canvas.attr('width', 1920);
      m_canvas.attr('height', 1080);
      this.container().node().append(m_canvas);
    }

    m_viewer = vgl.viewer(m_canvas.get(0));
    m_viewer.init();

    // TODO Take it out
    m_viewer.renderWindow().activeRenderer().setBackgroundColor(0.5, 0.5, 0.5, 1.0);
    m_viewer.renderWindow().resize(1920, 1080);
  };

  ////////////////////////////////////////////////////////////////////////////
  /**
   * Canvas
   */
  ////////////////////////////////////////////////////////////////////////////
  this._canvas = function() {
    return m_canvas;
  };


  ////////////////////////////////////////////////////////////////////////////
  /**
   * Get API used by the renderer
   */
  ////////////////////////////////////////////////////////////////////////////
  this._api = function() {
    return 'webgl';
  };

  ////////////////////////////////////////////////////////////////////////////
  /**
   * Render
   */
  ////////////////////////////////////////////////////////////////////////////
  this._contextRenderer = function() {
    return m_viewer.renderWindow().activeRenderer();
  };

  ////////////////////////////////////////////////////////////////////////////
  /**
   * Render
   */
  ////////////////////////////////////////////////////////////////////////////
  this._render = function() {
    m_viewer.renderWindow().activeRenderer().resetCamera();
    m_viewer.render();
  };

  ////////////////////////////////////////////////////////////////////////////
  /**
   * Exit
   */
  ////////////////////////////////////////////////////////////////////////////
  this._exit = function() {
  };

  this._init();
  return this;
};

inherit(ggl.simpleRenderer, geo.renderer);

geo.registerRenderer('simple_renderer', ggl.simpleRenderer);