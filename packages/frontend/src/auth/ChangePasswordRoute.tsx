/**
 * Change Password Route
 *
 * Voluntary password change (from User menu).
 * Navigates back to the site library after success.
 */

import { useNavigate } from 'react-router';
import ChangePasswordPage from './ChangePasswordPage';

function ChangePasswordRoute() {
  const navigate = useNavigate();

  return (
    <ChangePasswordPage
      onPasswordChanged={() => navigate('/sites/last')}
    />
  );
}

export default ChangePasswordRoute;
