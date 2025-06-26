                Object principal;

                if (role != null && role.toUpperCase().contains("ADMIN")) {
                    // 🔵 관리자일 경우 AdminUserDetails 사용 (ADMIN, SUPER_ADMIN 모두 허용)
                    String aid = claims.get("aid", String.class);
                    principal = new AdminUserDetails(aid, role);
                } else {
                    // 🔵 사용자일 경우 uno 필요
                    Integer unoInt = claims.get("uno", Integer.class);
                    if (unoInt == null) {
                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                        response.getWriter().write("Invalid JWT: missing uno for USER");
                        return;
                    }

                    Long uno = unoInt.longValue();
                    principal = new CustomUserDetails(uno, subject, "", authorities, role);
                } 