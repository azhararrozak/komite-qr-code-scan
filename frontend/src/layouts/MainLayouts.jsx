
import PropTypes from 'prop-types'
import HomepageHeader from '../components/organisms/Homepage/HomepageHeader'

const MainLayouts = ({ children }) => {
  return (
    <>
  <HomepageHeader />
      <main className="content">{children}</main>
    </>
  )
}

MainLayouts.propTypes = {
  children: PropTypes.node
}

export default MainLayouts