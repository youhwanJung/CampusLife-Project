import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../page/AuthContext'; // Adjust path based on your context location
import styles from './HeaderPage.module.css';
import logo from '../image/logo.png';
import { useLocation } from 'react-router-dom';

const HeaderPage = () => {
  const { isLoggedIn } = useAuth();
  const { professorData } = useAuth();
  const location = useLocation();
  const { ProfessorInfo } = location.state || {};

  if (!isLoggedIn) {
    return null; // Return null to hide the header when not logged in
  }

  return (
    <div className={styles.header}>
      <img src={logo} alt="Logo" className={styles.image} />
      <nav>
        <ul className={styles.nav}>
          <li className={styles.navItem}>
            <Link
              to="/"
              state={{ ProfessorInfo: professorData }}
              className={styles.navLink}
            >
              Home
            </Link>
          </li>
          <p className={styles.Professorname}>{ProfessorInfo.name} 교수님 </p>
        </ul>
      </nav>
    </div>
  );
};

export default HeaderPage;
