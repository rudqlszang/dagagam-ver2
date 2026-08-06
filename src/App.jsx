import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppFrame from './components/common/AppFrame'
import BottomNav from './components/common/BottomNav'
import { useStore } from './store/useStore'

import RoleSelect from './pages/RoleSelect'
import Consent from './pages/child/Consent'
import ChildHome from './pages/child/ChildHome'
import Conversation from './pages/child/Conversation'
import Summary from './pages/child/Summary'
import MyPage from './pages/child/MyPage'
import FriendPicker from './pages/child/FriendPicker'
import FriendMaker from './pages/child/FriendMaker'
import ParentDashboard from './pages/parent/ParentDashboard'
import ParentNotices from './pages/parent/ParentNotices'
import ParentTranscripts from './pages/parent/ParentTranscripts'
import TeacherClass from './pages/teacher/TeacherClass'
import TeacherMaterials from './pages/teacher/TeacherMaterials'
import TeacherNotices from './pages/teacher/TeacherNotices'

/** 아이 화면은 보호자 동의를 마쳐야 들어갈 수 있다 */
function RequireConsent({ children }) {
  const consented = useStore((s) => s.consented)
  return consented ? children : <Navigate to="/child/consent" replace />
}

/** 하단 내비를 감출 화면들 (몰입이 필요한 화면) */
const FULLSCREEN = ['/', '/child/consent', '/child/talk', '/child/summary']

function navRoleFor(pathname) {
  if (pathname.startsWith('/child')) return 'child'
  if (pathname.startsWith('/parent')) return 'parent'
  if (pathname.startsWith('/teacher')) return 'teacher'
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const role = navRoleFor(pathname)
  const hideNav = FULLSCREEN.some((p) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p),
  )

  return (
    <AppFrame>
      <div className="flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<RoleSelect />} />

          {/* 아이 */}
          <Route path="/child/consent" element={<Consent />} />
          <Route
            path="/child"
            element={
              <RequireConsent>
                <ChildHome />
              </RequireConsent>
            }
          />
          <Route
            path="/child/talk/:missionId"
            element={
              <RequireConsent>
                <Conversation />
              </RequireConsent>
            }
          />
          <Route path="/child/summary" element={<Summary />} />
          <Route
            path="/child/friends"
            element={
              <RequireConsent>
                <FriendPicker />
              </RequireConsent>
            }
          />
          <Route
            path="/child/friends/new"
            element={
              <RequireConsent>
                <FriendMaker />
              </RequireConsent>
            }
          />
          <Route
            path="/child/me"
            element={
              <RequireConsent>
                <MyPage />
              </RequireConsent>
            }
          />

          {/* 부모 */}
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/notices" element={<ParentNotices />} />
          <Route path="/parent/transcripts" element={<ParentTranscripts />} />

          {/* 교사 */}
          <Route path="/teacher" element={<TeacherClass />} />
          <Route path="/teacher/materials" element={<TeacherMaterials />} />
          <Route path="/teacher/notices" element={<TeacherNotices />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!hideNav && role && <BottomNav role={role} />}
    </AppFrame>
  )
}
