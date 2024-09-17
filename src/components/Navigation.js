import Navbar from 'react-bootstrap/Navbar';
import logo from '../logo.png';

const Navigation = () => {
    return (
        <Navbar>
            <img
                alt="logo"
                src={logo}
                width="100"
                height="100"
                className="d-inline-block align-top mx-3"
            />
            <Navbar.Brand href="#">DRGN ICO Crowdsale</Navbar.Brand>
        </Navbar>
    )
}

export default Navigation;
