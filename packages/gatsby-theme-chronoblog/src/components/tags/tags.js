/** @jsx jsx */
import { Badge } from '@theme-ui/components';
import { Link } from 'gatsby';
import _ from 'lodash';
import { jsx } from 'theme-ui';

import useFeed from '../../hooks/use-feed';
import useSiteMetadata from '../../hooks/use-site-metadata';
import Button from '../button';

/**
 * @typedef {object} TagWithStat
 * @property {string} tagName
 * @property {number} tagStat
 */

/**
 * @typedef {object} TagProps
 * @property {TagWithStat} tagWithStat
 * @property {string=} pageContextTag
 * @property {object} style
 */

/**
 * @param {TagProps=} props
 */
const Tag = ({ tagWithStat, style, pageContextTag }) => {
  const active = tagWithStat.tagName === pageContextTag;
  const link = active ? '/tags' : `/tags/${_.kebabCase(tagWithStat.tagName)}`;
  return (
    <Link to={link}>
      <Button sx={style} active={active}>
        #{tagWithStat.tagName}{' '}
        <Badge variant="tags" ml={1}>
          {tagWithStat.tagStat}
        </Badge>
      </Button>
    </Link>
  );
};

const AllTagsButton = ({ style }) => {
  const {
    uiText: { allTagsButton }
  } = useSiteMetadata();
  style = {
    ...style,
    boxShadow: (theme) => `inset 0 0 0 2px ${theme.colors.muted}`,
    bg: `rgba(0,0,0,0)`
  };
  return (
    <Link to="/tags">
      <Button sx={style}>{allTagsButton}</Button>
    </Link>
  );
};

/**
 * @typedef {object} TagsProps
 * @property {TagWithStat[]} tagsWithStat
 * @property {string} type
 * @property {boolean=} showAllTagsButton
 * @property {string=} pageContextTag
 */

/**
 * @param {TagsProps=} props
 */
const Tags = ({
  type,
  showAllTagsButton = false,
  tagsWithStat,
  pageContextTag
}) => {
  const style = {
    mr: type === 'feed' ? '6px' : '5px',
    my: type === 'feed' ? '3px' : '2.5px',
    px: type === 'feed' ? '16px' : '14px',
    py: type === 'feed' ? '10px' : '8px',
    fontSize: [2],
    opacity: 0.75
  };
  //
  return (
    <div>
      {type === 'feed' && showAllTagsButton ? (
        <AllTagsButton style={style} />
      ) : (
        ''
      )}
      {tagsWithStat.map((tws) => (
        <Tag
          key={tws.tagName}
          tagWithStat={tws}
          style={style}
          pageContextTag={pageContextTag}
        />
      ))}
    </div>
  );
};

/**
 * @param {string[]} tagsArray
 */
const createTagsStatistics = (tagsArray) => {
  const uniqTags = _.uniq(tagsArray);
  const tagsWithStats = uniqTags.map((uTag) => {
    const tagsArrayThisTag = tagsArray.filter((t) => t === uTag);
    return { tagName: uTag, tagStat: tagsArrayThisTag.length };
  });
  return tagsWithStats;
};

/**
 * @param {TagWithStat[]} array
 */
const sortTags = (array) => {
  array = _.sortBy(array, ['tagName']);
  array = array.reverse();
  array = _.sortBy(array, ['tagStat']);
  array = array.reverse();
  return array;
};

/**
 * @typedef {object} Props
 * @property {'feed' | 'item'=} type
 * @property {boolean=} showAllTagsButton
 * @property {string[]=} tags
 * @property {string=} pageContextTag
 */

/**
 * @param {Props=} props
 */
export default ({
  type = 'feed',
  showAllTagsButton = false,
  tags,
  pageContextTag
}) => {
  // get tags statistics
  const feedItems = useFeed();
  // item.frontmatter.tags
  let tagsFromItems = feedItems.map((i) => i.frontmatter.tags);
  tagsFromItems = _.flatten(tagsFromItems);
  tagsFromItems = tagsFromItems.filter(Boolean);
  let tagsWithStat = createTagsStatistics(tagsFromItems);
  tagsWithStat = sortTags(tagsWithStat);
  //
  if (type === 'feed') {
    return (
      <div id="tags" sx={{ marginY: [20] }}>
        <Tags
          type={type}
          showAllTagsButton={showAllTagsButton}
          tagsWithStat={tagsWithStat}
          pageContextTag={pageContextTag}
        />
      </div>
    );
  }
  //
  if (tags) {
    let tagsToShow = tags;
    tagsToShow = tagsToShow.filter((t) => typeof t === 'string');
    tagsToShow = tagsToShow.filter(Boolean);
    if (!tagsToShow) return <div />;
    //
    let tagsToShowWithStat = tagsToShow.map((tts) =>
      _.find(tagsWithStat, { tagName: tts })
    );
    tagsToShowWithStat = tagsToShowWithStat.filter(Boolean);
    //
    if (tagsToShowWithStat) {
      tagsToShowWithStat = sortTags(tagsToShowWithStat);
      return <Tags type={type} tagsWithStat={tagsToShowWithStat} />;
    }
  }
  //
  return <div />;
};
