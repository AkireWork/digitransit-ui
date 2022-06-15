import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';

import {
  drawAmenitiesIcon,
} from '../../../util/mapIconUtils';
import { Contour } from '../../../util/geo-utils';
import { isBrowser } from '../../../util/browser';

const showFacilities = 14;

export default class Amenities {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;
    const scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.width = 16 * scaleratio;
    this.height = 16 * scaleratio;
    this.promise = this.getPromise();
  }

  static getName = () => 'amenities';

  getPromise() {
    return fetch(
      `${this.config.URL.AMENITIES_MAP}${this.tile.coords.z +
        (this.tile.props.zoomOffset || 0)}` +
        `/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));

          this.features = [];

          if (
            this.tile.coords.z >= showFacilities &&
            vt.layers.facilities != null
          ) {
            for (
              let i = 0, ref = vt.layers.facilities.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.facilities.feature(i);
              if (feature.type === 1) {
                // Point
                [[feature.geom]] = feature.loadGeometry();
              } else {
                feature.geom = new Contour(
                  feature.loadGeometry()[0],
                ).centroid();
              }
              [[feature.geom]] = feature.loadGeometry();
              drawAmenitiesIcon(
                this.tile,
                feature.geom,
                this.width,
                this.height,
              );
            }
          }
        },
        err => console.log(err),
      );
    });
  }
}
