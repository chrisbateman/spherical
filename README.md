Spherical.js
=========

This was mainly a personal experiment to display spherical panoramas with CSS 3D transforms. You can see it in action [here] (http://chrisbateman.github.io/spherical/).

The only thing you'll need to use it is a full 360x180 panorama, broken up into the six sides of a [cubic projection] (http://wiki.panotools.org/index.php?title=Cubic_Projection). Generating a cubic projection isn't too tricky with [Hugin] (http://hugin.sourceforge.net/).

Include the JS and CSS, make a &lt;div&gt; for it to live in, and instantiate it:

```javascript
new Spherical({
    container: '#pano',
    front: 'images/front.jpg',
    back: 'images/back.jpg',
    left: 'images/left.jpg',
    right: 'images/right.jpg',
    top: 'images/top.jpg',
    bottom: 'images/bottom.jpg'
});
```

 - Spherical.js works in Chrome, Firefox, iOS, and hopefully Android 4+. IE's a no-go until they start supporting preserve-3d.
 - Includes full-screen mode for browsers that support the Fullscreen API.
 - Zooming works, but is a bit buggy at the moment.
 - Supports AMD.
