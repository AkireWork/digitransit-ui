import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import SplitBars from './SplitBars';
import Favourite from './Favourite';
import { Link } from 'react-router';

const CardHeader = ({
  className,
  children,
  headerIcon,
  headingStyle,
  secondaryLink,
  name,
  url,
  description,
  code,
  externalLink,
  icon,
  icons,
  unlinked,
}) => (
  <div className={cx('card-header', className)}>
    {children}
    <div className="card-header-content">
      {icon ? (
        <div
          className="left"
          style={{ fontSize: 32, paddingRight: 10, height: 32 }}
        >
          <Icon img={icon} />
        </div>
      ) : null}
      {className === 'stop-page header' && (
        <div className="stop-page-header_icon-container">
          <Icon img="icon-icon_bus-stop" className="stop-page-header_icon" />
        </div>
      )}
      <div className="card-header-wrapper">
        {secondaryLink && (
          <div className="card-header-secondary-link">
            {secondaryLink}
          </div>
        )}
        <span className={headingStyle || 'h4'}>
          {url ? <Link to={url}>{name}</Link> : `${name}`}
          {externalLink || null}
          {headerIcon}
          {unlinked ? null : <span className="link-arrow"> ›</span>}
        </span>
        <div className="card-sub-header">
          {code != null ? <p className="card-code">{code}</p> : null}
          {description != null && description !== 'null' ? (
            <p className="sub-header-h4">{description}</p>
          ) : null}
        </div>
      </div>
      {icons && icons.length ? <SplitBars>{icons}</SplitBars> : null}
    </div>
  </div>
);

const emptyFunction = () => {};
const exampleIcons = [
  <Favourite key="favourite" favourite={false} addFavourite={emptyFunction} />,
];

CardHeader.displayName = 'CardHeader';

CardHeader.description = () => (
  <div>
    <p>
      Generic card header, which displays card name, description, favourite star
      and optional childs
    </p>
    <ComponentUsageExample description="">
      <CardHeader
        name="Testipysäkki"
        description="Testipysäkki 2"
        code="7528"
        icons={exampleIcons}
        headingStyle="header-primary"
      />
    </ComponentUsageExample>
  </div>
);

CardHeader.propTypes = {
  className: PropTypes.string,
  headerIcon: PropTypes.node,
  headingStyle: PropTypes.string,
  secondaryLink: PropTypes.node,
  name: PropTypes.string.isRequired,
  url: PropTypes.string,
  description: PropTypes.string.isRequired,
  code: PropTypes.string,
  externalLink: PropTypes.node,
  icon: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  children: PropTypes.node,
  unlinked: PropTypes.bool,
};

CardHeader.defaultProps = {
  headerIcon: undefined,
};

export default CardHeader;
