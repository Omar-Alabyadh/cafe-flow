--
-- PostgreSQL database dump
--

\restrict Flvm6rgoIDciv8DJgL91sFR3KBgMVZmha298BtChw5yo1RGl60pnfQQkq9C7hKZ

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnnm7j2p0000eysgi4u6sorx', 'CafeFlow Owner', 'owner@cafeflow.local', 'AR', false, '2026-04-06 20:00:28.754', '2026-04-06 20:00:28.754', NULL, '$2b$12$j3j1whiSTXPSkjgUg4MnguHXFsJ/LpE8nZNiv1L60Mqr1nrrqHwte', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnnowcpd0000ey4svswjhku6', 'CafeFlow Owner', 'staff@cafeflow.local', 'AR', false, '2026-04-06 21:15:46.13', '2026-04-06 21:15:46.13', NULL, '$2b$12$f9z4rQ7QO1I.prMo95FI7OnbITem75JWleuHS2W/NAu2Q6KbN9T4O', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnocmubb0000eyh4r1qtqnxr', 'CafeFlow Owner', 'owner2@cafeflow.local', 'AR', false, '2026-04-07 08:20:13.175', '2026-04-07 08:20:13.175', NULL, '$2b$12$tP/RfsCFu4F5ocK62OT2FOO.kiN3VsiF9Bn8U6QCnhPCcfT8XDpo.', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnodibp40000ey40wkqr85jx', 'Test Cafe', 'testowner@cafeflow.com', 'AR', false, '2026-04-07 08:44:42.035', '2026-04-07 08:44:42.035', NULL, '$2b$12$L3DjZcCjwNMOgicWuzX2RuSVG2B8D4Q7bGgHi/sFjlp69lF1n8IWW', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnqbxvl20000eyq0989uhl8v', 'Me', 'me@cafeflow.local', 'AR', false, '2026-04-08 17:36:20.774', '2026-04-08 17:36:20.774', NULL, '$2b$12$JWNdnLwClmPOV/WsmI0ENu2eoAnwV3AsFIcNBdRFXhyd0XGTH0Rg2', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnwbmecx0004eyi02hte4crb', 'رجب محمود', 'ragab.mahmoud.cashier@omarcafe.cafeflow.local', 'AR', false, '2026-04-12 22:14:02.289', '2026-04-12 22:14:02.289', NULL, '$2b$12$WzWfMSnn9XIhfXa2yPRl8.cy619j8stcYyx.HBszWiXTKKwUtlKgG', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnwc5yfv000deyi0a5g5mwhz', 'محمد طارق', 'mohamed.tarek.barista@omarcafe.cafeflow.local', 'AR', false, '2026-04-12 22:29:14.78', '2026-04-12 22:29:14.78', NULL, '$2b$12$Amrk2xAxHGhJNX3TP6zuGuuFEw7r/ocov47w.r7hnBxr9VIiWL8/e', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnwcym4i000meyi0y0nb2bwo', 'حسين بن غزي', 'hussien.benghzi.manager@omarcafe.cafeflow.local', 'AR', false, '2026-04-12 22:51:31.842', '2026-04-12 22:51:31.842', NULL, '$2b$12$LQFGpLYuQE8VUT6BT8YR3eQsdvMdLXerG3cJjP27IMkXl/yDy.jYi', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnwdsbvv000veyi0pfb5ct13', 'محمد القطعاني', 'mohamed.elktaani.purchasing@omarcafe.cafeflow.local', 'AR', false, '2026-04-12 23:14:38.251', '2026-04-12 23:14:38.251', NULL, '$2b$12$5rXprNubOZbb1Q4kLQR/vOSVFgGRb1KOjc7Xqgk3yv8INWHlhDLhu', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnxgcy3f000leym4ppx5tw7v', 'صالح البرعصي', 'salih.alburesiu.cashier@omarcafe.cafeflow.local', 'AR', false, '2026-04-13 17:14:25.562', '2026-04-13 17:14:25.562', NULL, '$2b$12$77yO5Xz1Zz1UMKdVUyWWKueE4kv.xDJ.bSboxfn2Bx7HYMilo97xO', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnxh0oo00016eym4058ncyts', 'محمد بن غزي', 'mohamed.benghzi.stock@omarcafe.cafeflow.local', 'AR', false, '2026-04-13 17:32:53.089', '2026-04-13 17:32:53.089', NULL, '$2b$12$JZEtto0JGBWlNGmGooiybOSsk/Ut.8pSGJ65YvomTJQNp60bxe3P6', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnxpz5ln000ceyr0wmj3og9t', 'رجب محمود', 'ragab@cafeflow.local', 'AR', false, '2026-04-13 21:43:38.268', '2026-04-13 21:43:38.268', NULL, '$2b$12$gY/2COFF/oyXe9012BKRpOng7z.uYeee6hSUzcvB2pJiNGV2/RdO.', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnxrr4as0000ey4gz57qh52n', 'محمد الرملي', 'hamade.alramle.accounting@omarcafe.cafeflow.local', 'AR', false, '2026-04-13 22:33:22.564', '2026-04-13 22:33:22.564', NULL, '$2b$12$DyKGkJlrR1oSEpZNzNgioOyWA.GDJYP1.epSkgxs3DiU.TlvEonMa', NULL);
INSERT INTO public."User" (id, "fullName", email, "preferredLanguage", "isPlatformOwner", "createdAt", "updatedAt", "archivedAt", "passwordHash", "fullNameEn") VALUES ('cmnx7kd3q0000eym4y4z6ohlb', 'عمر الأبيض', 'omaralabyadh@gmail.com', 'AR', true, '2026-04-13 13:08:15.061', '2026-04-13 13:08:15.061', NULL, '$2b$12$2DHy2hGomdk6CkWM1xV7..gvTRe5g98ShJ1l5kozV72w7KfWuATHy', NULL);


--
-- Data for Name: Business; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Business" (id, code, "nameAr", "nameEn", status, "defaultLanguage", "ownerId", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnnnw8ab0001eyrkejds4lph', 'alabyadh-cafe', 'كافي الأبيض', 'Cafe Alabyadh', 'ACTIVE', 'AR', 'cmnnm7j2p0000eysgi4u6sorx', '2026-04-06 20:47:40.787', '2026-04-06 20:47:40.787', NULL);
INSERT INTO public."Business" (id, code, "nameAr", "nameEn", status, "defaultLanguage", "ownerId", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnqcz7930007eyq0eqlmq8tp', 'me-test-cafe', 'مي كافي للإختبار', 'Me Test Cafe', 'ACTIVE', 'AR', 'cmnqbxvl20000eyq0989uhl8v', '2026-04-08 18:05:22.167', '2026-04-08 18:05:22.167', NULL);
INSERT INTO public."Business" (id, code, "nameAr", "nameEn", status, "defaultLanguage", "ownerId", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnvn3gi30001eywonooiglki', 'omar-cafe', 'كافي عمر', 'Omar Coffee Shop', 'ACTIVE', 'AR', 'cmnocmubb0000eyh4r1qtqnxr', '2026-04-12 10:47:27.818', '2026-04-12 10:47:27.818', NULL);


--
-- Data for Name: Addon; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Addon" (id, "businessId", code, "nameAr", "nameEn", "extraPrice", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnnq4y8d000bey745imqkxtp', 'cmnnnw8ab0001eyrkejds4lph', 'caramel-sauce', 'صوص كراميل', 'Caramel sauce', 1.00, true, '2026-04-06 21:50:26.894', '2026-04-06 21:50:26.894', NULL);
INSERT INTO public."Addon" (id, "businessId", code, "nameAr", "nameEn", "extraPrice", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmo1tkxk1000jeyushzeb3eaq', 'cmnvn3gi30001eywonooiglki', 'caramel-syrup', 'نكهة الكراميل', 'Caramel syrup', 1.00, true, '2026-04-16 18:35:37.825', '2026-04-16 18:35:37.825', NULL);


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Branch" (id, "businessId", code, "nameAr", "nameEn", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnnnxybx0005eyrkpa8uoef4', 'cmnnnw8ab0001eyrkejds4lph', 'MAIN', 'كافي الأبيض', 'Cafe Alabyadh', false, '2026-04-06 20:49:01.197', '2026-04-06 20:49:27.379', '2026-04-06 20:49:27.371');
INSERT INTO public."Branch" (id, "businessId", code, "nameAr", "nameEn", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnno1z31000deyrkgjawt52j', 'cmnnnw8ab0001eyrkejds4lph', 'ELMAJORY', 'كافي الأبيض - فرع الماجوري', 'Cafe Alabyadh - Elmajory branch', false, '2026-04-06 20:52:08.797', '2026-04-06 21:17:50.403', '2026-04-06 21:17:50.401');
INSERT INTO public."Branch" (id, "businessId", code, "nameAr", "nameEn", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnvnte4k000veywo5s6oodzp', 'cmnvn3gi30001eywonooiglki', 'MAIN', 'فرع - كافي عمر - الرئيسي', 'Main Branch - Omar Cafe', true, '2026-04-12 11:07:37.796', '2026-04-12 16:29:21.326', NULL);
INSERT INTO public."Branch" (id, "businessId", code, "nameAr", "nameEn", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnxg6rmd000geym4uekfvz1b', 'cmnvn3gi30001eywonooiglki', 'فرع-الجامعة', 'فرع الجامعة', 'University Branch', true, '2026-04-13 17:09:37.234', '2026-04-13 17:09:37.234', NULL);


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnwaq7en0003eyi0wjur3t1f', 'cmnocmubb0000eyh4r1qtqnxr', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'authorization.staff_invite.created', 'StaffInvite', 'cmnwaq7ec0001eyi0zmmnc89x', '{"actorName":"CafeFlow Owner","publicInviteLabel":"invite-cashier-4f576d","contactEmail":null}', '{"role":"CASHIER","scope":"BRANCH_ONLY","branchId":"cmnvnte4k000veywo5s6oodzp","grantedPermissions":[],"revokedPermissions":[],"templateKey":"DEFAULT","expiresAt":"2026-04-19T21:49:00.255Z"}', '2026-04-12 21:49:00.287');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnwbmedd0008eyi0ynhynqmz', 'cmnwbmecx0004eyi02hte4crb', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'authorization.staff_invite.registered', 'StaffInvite', 'cmnwaq7ec0001eyi0zmmnc89x', '{"publicInviteLabel":"invite-cashier-4f576d","role":"CASHIER","scope":"BRANCH_ONLY"}', '{"systemLoginEmail":"ragab.mahmoud.cashier@omarcafe.cafeflow.local","membershipCreated":true}', '2026-04-12 22:14:02.305');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnwc4t1n000ceyi0t5igavq1', 'cmnocmubb0000eyh4r1qtqnxr', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'authorization.staff_invite.created', 'StaffInvite', 'cmnwc4t1k000aeyi04diaa4ns', '{"actorName":"CafeFlow Owner","publicInviteLabel":"invite-barista-053cbf","contactEmail":null}', '{"role":"BARISTA","scope":"BRANCH_ONLY","branchId":"cmnvnte4k000veywo5s6oodzp","grantedPermissions":[],"revokedPermissions":[],"templateKey":"DEFAULT","expiresAt":"2026-04-19T22:28:21.109Z"}', '2026-04-12 22:28:21.131');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnwc5yg7000heyi07nbeeq0f', 'cmnwc5yfv000deyi0a5g5mwhz', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'authorization.staff_invite.registered', 'StaffInvite', 'cmnwc4t1k000aeyi04diaa4ns', '{"publicInviteLabel":"invite-barista-053cbf","role":"BARISTA","scope":"BRANCH_ONLY"}', '{"systemLoginEmail":"mohamed.tarek.barista@omarcafe.cafeflow.local","membershipCreated":true}', '2026-04-12 22:29:14.791');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnwcxf9o000leyi0l5c3cur4', 'cmnocmubb0000eyh4r1qtqnxr', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'authorization.staff_invite.created', 'StaffInvite', 'cmnwcxf94000jeyi0lm6k18ip', '{"actorName":"CafeFlow Owner","publicInviteLabel":"invite-manager-207dd0","contactEmail":null}', '{"role":"MANAGER","scope":"BRANCH_ONLY","branchId":"cmnvnte4k000veywo5s6oodzp","grantedPermissions":[],"revokedPermissions":[],"templateKey":"DEFAULT","expiresAt":"2026-04-19T22:50:36.245Z"}', '2026-04-12 22:50:36.301');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnwcym4x000qeyi02a5y71qk', 'cmnwcym4i000meyi0y0nb2bwo', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'authorization.staff_invite.registered', 'StaffInvite', 'cmnwcxf94000jeyi0lm6k18ip', '{"publicInviteLabel":"invite-manager-207dd0","role":"MANAGER","scope":"BRANCH_ONLY"}', '{"systemLoginEmail":"hussien.benghzi.manager@omarcafe.cafeflow.local","membershipCreated":true}', '2026-04-12 22:51:31.857');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnwd4nrf000ueyi00cbs6n0f', 'cmnocmubb0000eyh4r1qtqnxr', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'authorization.staff_invite.created', 'StaffInvite', 'cmnwd4nqp000seyi07ltzq6wv', '{"actorName":"CafeFlow Owner","publicInviteLabel":"invite-purchasing-36ce46","contactEmail":null}', '{"role":"PURCHASING_MANAGER","scope":"BRANCH_ONLY","branchId":"cmnvnte4k000veywo5s6oodzp","grantedPermissions":[],"revokedPermissions":[],"templateKey":"DEFAULT","expiresAt":"2026-04-19T22:56:13.846Z"}', '2026-04-12 22:56:13.899');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnwdsbw6000zeyi0a5eg3vjf', 'cmnwdsbvv000veyi0pfb5ct13', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'authorization.staff_invite.registered', 'StaffInvite', 'cmnwd4nqp000seyi07ltzq6wv', '{"publicInviteLabel":"invite-purchasing-36ce46","role":"PURCHASING_MANAGER","scope":"BRANCH_ONLY"}', '{"systemLoginEmail":"mohamed.elktaani.purchasing@omarcafe.cafeflow.local","membershipCreated":true}', '2026-04-12 23:14:38.262');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnxgaq6o000keym47vw8tk9t', 'cmnocmubb0000eyh4r1qtqnxr', 'cmnvn3gi30001eywonooiglki', 'cmnxg6rmd000geym4uekfvz1b', 'authorization.staff_invite.created', 'StaffInvite', 'cmnxgaq6h000ieym4vg3fqh5f', '{"actorName":"CafeFlow Owner","publicInviteLabel":"invite-cashier-67dc66","contactEmail":null}', '{"role":"CASHIER","scope":"BRANCH_ONLY","branchId":"cmnxg6rmd000geym4uekfvz1b","grantedPermissions":[],"revokedPermissions":[],"templateKey":"DEFAULT","expiresAt":"2026-04-20T17:12:41.969Z"}', '2026-04-13 17:12:42');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnxgcy3u000peym456pl2j8v', 'cmnxgcy3f000leym4ppx5tw7v', 'cmnvn3gi30001eywonooiglki', 'cmnxg6rmd000geym4uekfvz1b', 'authorization.staff_invite.registered', 'StaffInvite', 'cmnxgaq6h000ieym4vg3fqh5f', '{"publicInviteLabel":"invite-cashier-67dc66","role":"CASHIER","scope":"BRANCH_ONLY"}', '{"systemLoginEmail":"salih.alburesiu.cashier@omarcafe.cafeflow.local","membershipCreated":true}', '2026-04-13 17:14:25.578');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnxgyp0k0015eym4lkn5ew04', 'cmnocmubb0000eyh4r1qtqnxr', 'cmnvn3gi30001eywonooiglki', 'cmnxg6rmd000geym4uekfvz1b', 'authorization.staff_invite.created', 'StaffInvite', 'cmnxgyp0e0013eym4h80lcr4p', '{"actorName":"CafeFlow Owner","publicInviteLabel":"invite-stock-184fcd","contactEmail":null}', '{"role":"INVENTORY_MANAGER","scope":"BRANCH_ONLY","branchId":"cmnxg6rmd000geym4uekfvz1b","grantedPermissions":[],"revokedPermissions":[],"templateKey":"DEFAULT","expiresAt":"2026-04-20T17:31:20.198Z"}', '2026-04-13 17:31:20.228');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnxh0ood001aeym4rradtboq', 'cmnxh0oo00016eym4058ncyts', 'cmnvn3gi30001eywonooiglki', 'cmnxg6rmd000geym4uekfvz1b', 'authorization.staff_invite.registered', 'StaffInvite', 'cmnxgyp0e0013eym4h80lcr4p', '{"publicInviteLabel":"invite-stock-184fcd","role":"INVENTORY_MANAGER","scope":"BRANCH_ONLY"}', '{"systemLoginEmail":"mohamed.benghzi.stock@omarcafe.cafeflow.local","membershipCreated":true}', '2026-04-13 17:32:53.101');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnxr6ifj000geyr0qh9ovwsx', 'cmnocmubb0000eyh4r1qtqnxr', 'cmnvn3gi30001eywonooiglki', NULL, 'authorization.staff_invite.created', 'StaffInvite', 'cmnxr6iff000eeyr0c62ocyfe', '{"actorName":"CafeFlow Owner","publicInviteLabel":"invite-accounting-eae23a","contactEmail":null}', '{"role":"ACCOUNTANT","scope":"ALL_BRANCHES","branchId":null,"grantedPermissions":[],"revokedPermissions":[],"templateKey":"DEFAULT","expiresAt":"2026-04-20T22:17:21.074Z"}', '2026-04-13 22:17:21.104');
INSERT INTO public."AuditLog" (id, "actorUserId", "businessId", "branchId", action, "entityType", "entityId", "beforeSnapshot", "afterSnapshot", "createdAt") VALUES ('cmnxrr4b10004ey4gewao3y84', 'cmnxrr4as0000ey4gz57qh52n', 'cmnvn3gi30001eywonooiglki', NULL, 'authorization.staff_invite.registered', 'StaffInvite', 'cmnxr6iff000eeyr0c62ocyfe', '{"publicInviteLabel":"invite-accounting-eae23a","role":"ACCOUNTANT","scope":"ALL_BRANCHES"}', '{"systemLoginEmail":"hamade.alramle.accounting@omarcafe.cafeflow.local","membershipCreated":true}', '2026-04-13 22:33:22.573');


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Category" (id, "businessId", code, "nameAr", "nameEn", description, "createdAt", "updatedAt", "archivedAt") VALUES ('cmnnpu42g0001ey74vp0tq7wm', 'cmnnnw8ab0001eyrkejds4lph', 'hot-drinks', 'مشروبات ساخنة', 'Hot Drinks', NULL, '2026-04-06 21:42:01.24', '2026-04-09 01:07:36.522', NULL);
INSERT INTO public."Category" (id, "businessId", code, "nameAr", "nameEn", description, "createdAt", "updatedAt", "archivedAt") VALUES ('cmnvn6ibm0007eywoa3352kb6', 'cmnvn3gi30001eywonooiglki', 'hot-drinks', 'مشروبات ساخنة', 'Hot Drinks', NULL, '2026-04-12 10:49:50.146', '2026-04-12 10:49:50.146', NULL);
INSERT INTO public."Category" (id, "businessId", code, "nameAr", "nameEn", description, "createdAt", "updatedAt", "archivedAt") VALUES ('cmo1tglik000feyusss7ty6on', 'cmnvn3gi30001eywonooiglki', 'cold-drinks', 'مشروبات باردة', 'Cold Drinks', NULL, '2026-04-16 18:32:15.596', '2026-04-16 18:32:15.596', NULL);


--
-- Data for Name: Membership; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnnnw8ai0003eyrktr7be5ng', 'cmnnm7j2p0000eysgi4u6sorx', 'cmnnnw8ab0001eyrkejds4lph', NULL, 'OWNER', true, '2026-04-06 20:47:40.794', '2026-04-06 20:47:40.794', '2026-04-06 20:47:40.794', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnnoxmzt0001eyikgnaq032p', 'cmnnowcpd0000ey4svswjhku6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnno1z31000deyrkgjawt52j', 'MANAGER', false, '2026-04-06 21:16:46.122', '2026-04-06 21:16:46.122', '2026-04-06 21:17:10.293', '2026-04-06 21:17:10.292', 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnqcz7960009eyq0cgha1tcv', 'cmnqbxvl20000eyq0989uhl8v', 'cmnqcz7930007eyq0eqlmq8tp', NULL, 'OWNER', true, '2026-04-08 18:05:22.171', '2026-04-08 18:05:22.171', '2026-04-08 18:05:22.171', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnvn3gic0003eywo9byqd59y', 'cmnocmubb0000eyh4r1qtqnxr', 'cmnvn3gi30001eywonooiglki', NULL, 'OWNER', true, '2026-04-12 10:47:27.828', '2026-04-12 10:47:27.828', '2026-04-12 10:47:27.828', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnwbmecz0006eyi0h9413xwj', 'cmnwbmecx0004eyi02hte4crb', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'CASHIER', true, '2026-04-12 22:14:02.292', '2026-04-12 22:14:02.292', '2026-04-12 22:14:02.292', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnwc5yfy000feyi0st4kioce', 'cmnwc5yfv000deyi0a5g5mwhz', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'BARISTA', true, '2026-04-12 22:29:14.782', '2026-04-12 22:29:14.782', '2026-04-12 22:29:14.782', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnwcym4l000oeyi0stkj4v00', 'cmnwcym4i000meyi0y0nb2bwo', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'MANAGER', true, '2026-04-12 22:51:31.845', '2026-04-12 22:51:31.845', '2026-04-12 22:51:31.845', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnwdsbvx000xeyi06dw561f4', 'cmnwdsbvv000veyi0pfb5ct13', 'cmnvn3gi30001eywonooiglki', 'cmnvnte4k000veywo5s6oodzp', 'PURCHASING_MANAGER', true, '2026-04-12 23:14:38.254', '2026-04-12 23:14:38.254', '2026-04-12 23:14:38.254', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnxgcy3l000neym4nutok8ln', 'cmnxgcy3f000leym4ppx5tw7v', 'cmnvn3gi30001eywonooiglki', 'cmnxg6rmd000geym4uekfvz1b', 'CASHIER', true, '2026-04-13 17:14:25.568', '2026-04-13 17:14:25.568', '2026-04-13 17:14:25.568', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnxh0oo40018eym44qep4x8j', 'cmnxh0oo00016eym4058ncyts', 'cmnvn3gi30001eywonooiglki', 'cmnxg6rmd000geym4uekfvz1b', 'INVENTORY_MANAGER', true, '2026-04-13 17:32:53.092', '2026-04-13 17:32:53.092', '2026-04-13 17:32:53.092', NULL, 'BRANCH_ONLY', '{}', '{}');
INSERT INTO public."Membership" (id, "userId", "businessId", "branchId", role, "isActive", "joinedAt", "createdAt", "updatedAt", "archivedAt", scope, "grantedPermissions", "revokedPermissions") VALUES ('cmnxrr4au0002ey4gg2k6spku', 'cmnxrr4as0000ey4gz57qh52n', 'cmnvn3gi30001eywonooiglki', NULL, 'ACCOUNTANT', true, '2026-04-13 22:33:22.566', '2026-04-13 22:33:22.566', '2026-04-13 22:33:22.566', NULL, 'ALL_BRANCHES', '{}', '{}');


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnoat6t00001eyd42j2jiehf', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', NULL, '2026-04-07 07:29:10.068', '2026-04-07 07:30:43.769', NULL, NULL);
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnob48c00009eyd461uhjx5c', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', NULL, '2026-04-07 07:37:45.264', '2026-04-07 07:39:00.641', NULL, NULL);
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnonq66d0005eygcxtmu6pa5', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', NULL, '2026-04-07 13:30:44.292', '2026-04-07 13:30:59.63', NULL, '2026-04-07 13:30:59.628');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnoo2d73000beygc9wkxcuqp', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', NULL, '2026-04-07 13:40:13.264', '2026-04-07 13:40:38.246', NULL, '2026-04-07 13:40:38.244');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnou033z000jeygcpnsriwlo', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-07 16:26:24.575', '2026-04-07 16:26:24.615', NULL, '2026-04-07 16:26:24.613');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnou0slw000peygco0w8ijje', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-07 16:26:57.62', '2026-04-07 16:26:57.645', NULL, '2026-04-07 16:26:57.643');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnou1mpy000veygcxpzy31f6', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-07 16:27:36.647', '2026-04-07 16:27:36.697', NULL, '2026-04-07 16:27:36.695');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnox34pu001heygcj3sizbsn', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-07 17:52:45.474', '2026-04-07 17:52:45.511', NULL, '2026-04-07 17:52:45.51');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnox4ry8001veygcct4o749c', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-07 17:54:02.24', '2026-04-07 17:54:02.282', NULL, '2026-04-07 17:54:02.28');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnpxhmex0027eygcltt60n4a', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 10:51:47.769', '2026-04-08 10:51:47.819', NULL, '2026-04-08 10:51:47.806');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnpy5hk70001ey8ook4sa6ac', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 11:10:21.223', '2026-04-08 11:10:21.265', NULL, '2026-04-08 11:10:21.263');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnpy5md5000dey8o0xg9yge8', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 11:10:27.449', '2026-04-08 11:10:27.483', NULL, '2026-04-08 11:10:27.481');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnpy5o7s000pey8oshlocxrz', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 11:10:29.849', '2026-04-08 11:10:29.879', NULL, '2026-04-08 11:10:29.878');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq0r0xo0001eym8jhsuteux', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 12:23:05.339', '2026-04-08 12:23:05.399', NULL, '2026-04-08 12:23:05.384');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq0y1r0000deym8axs8r1mh', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 12:28:32.988', '2026-04-08 12:28:33.035', NULL, '2026-04-08 12:28:33.033');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq1slwa000peym8odqkxfpq', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 12:52:18.778', '2026-04-08 12:52:18.825', NULL, '2026-04-08 12:52:18.823');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq2pdh90011eym8mqy5sx35', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 13:17:47.518', '2026-04-08 13:17:47.586', NULL, '2026-04-08 13:17:47.585');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq2y1f70001eyhgg3p8ra84', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 13:24:31.795', '2026-04-08 13:24:31.864', NULL, '2026-04-08 13:24:31.861');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq2zjw0000deyhgebghq8x7', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 13:25:42.384', '2026-04-08 13:25:42.417', NULL, '2026-04-08 13:25:42.415');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq3aj5x000peyhggh3zuv03', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 13:34:14.661', '2026-04-08 13:34:14.699', NULL, '2026-04-08 13:34:14.697');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq5vw7x0001eyy425suqpp9', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 14:46:50.588', '2026-04-08 14:46:50.642', NULL, '2026-04-08 14:46:50.64');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq5ykmd000deyy42jn7vnqi', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 14:48:55.526', '2026-04-08 14:48:55.557', NULL, '2026-04-08 14:48:55.555');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq5yupv000jeyy4tgn5lft5', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 14:49:08.611', '2026-04-08 14:49:08.646', NULL, '2026-04-08 14:49:08.643');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq78xbf000veyy4xzi84vtn', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 15:24:58.155', '2026-04-08 15:24:58.21', NULL, '2026-04-08 15:24:58.199');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq79iqh0017eyy451ibbv49', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 15:25:25.913', '2026-04-08 15:25:25.959', NULL, '2026-04-08 15:25:25.948');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq79xaq001jeyy4nbyl4xoh', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 15:25:44.787', '2026-04-08 15:25:44.832', NULL, '2026-04-08 15:25:44.827');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnq8t6u9001veyy4csv8xcbl', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 16:08:43.234', '2026-04-08 16:08:43.293', NULL, '2026-04-08 16:08:43.292');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqavcpt0027eyy4epyibx7f', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 17:06:23.394', '2026-04-08 17:06:23.539', NULL, '2026-04-08 17:06:23.536');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqayrhv002leyy472a51obo', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 17:09:02.515', '2026-04-08 17:09:02.544', NULL, '2026-04-08 17:09:02.537');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqb7m2k002reyy408o6lnis', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 17:15:55.389', '2026-04-08 17:15:55.45', NULL, '2026-04-08 17:15:55.446');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnosrdg2000heygctsphg0ew', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', NULL, '2026-04-07 15:51:38.448', '2026-04-08 17:42:00.604', NULL, '2026-04-08 17:42:00.601');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqk3gvg0001eyo00spav5ix', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', NULL, '2026-04-08 21:24:38.565', '2026-04-08 21:25:31.402', NULL, '2026-04-08 21:25:31.395');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnob60bs000neyd4783sohxj', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', NULL, '2026-04-07 07:39:08.2', '2026-04-08 22:03:43.04', NULL, '2026-04-08 22:03:43.035');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqmawqv0001eyng2wv55x4l', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 22:26:24.965', '2026-04-08 22:26:25.048', NULL, '2026-04-08 22:26:25.04');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqnb747000deyngf8qnfz4k', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 22:54:38.023', '2026-04-08 22:54:38.108', NULL, '2026-04-08 22:54:38.099');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqnyb4r000peynga0m2jaid', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:12:36.315', '2026-04-08 23:12:36.435', NULL, '2026-04-08 23:12:36.43');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqnywfg0011eyngqz18gqdp', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:13:03.916', '2026-04-08 23:13:03.945', NULL, '2026-04-08 23:13:03.94');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqnzcfj0017eyngt5mxnhkb', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:13:24.655', '2026-04-08 23:13:24.729', NULL, '2026-04-08 23:13:24.724');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqoanna001jeynga9pzs599', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:22:12.406', '2026-04-08 23:22:12.469', NULL, '2026-04-08 23:22:12.46');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqob33p001reyngqj7x5xjo', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:22:32.437', '2026-04-08 23:22:32.485', NULL, '2026-04-08 23:22:32.477');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqorcb80023eynge7s5m5ji', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:35:10.868', '2026-04-08 23:35:10.96', NULL, '2026-04-08 23:35:10.955');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqotjpv002feynglo1lwlzy', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:36:53.78', '2026-04-08 23:36:53.831', NULL, '2026-04-08 23:36:53.829');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqotnfm002reynga4qa11xm', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:36:58.594', '2026-04-08 23:36:58.643', NULL, '2026-04-08 23:36:58.641');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqotoh20033eyngxivv1xk5', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:36:59.943', '2026-04-08 23:36:59.989', NULL, '2026-04-08 23:36:59.987');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqotpun003feyngb54vhj7g', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:37:01.727', '2026-04-08 23:37:01.794', NULL, '2026-04-08 23:37:01.791');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqpb6t3003reyngk3tk9vew', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:50:36.855', '2026-04-08 23:50:37.051', NULL, '2026-04-08 23:50:37.043');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqpcezi0043eyng2hxr3lg5', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:51:34.11', '2026-04-08 23:51:34.164', NULL, '2026-04-08 23:51:34.161');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqpdzgf004beyngtfjm1mir', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:52:47.296', '2026-04-08 23:52:47.344', NULL, '2026-04-08 23:52:47.339');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqpelc7004jeyngsesms3z7', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:53:15.655', '2026-04-08 23:53:15.686', NULL, '2026-04-08 23:53:15.685');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqpfyqk004peyngkvhepep3', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:54:19.676', '2026-04-08 23:54:19.718', NULL, '2026-04-08 23:54:19.709');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqpiqsg004xeyngrjc95wcy', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:56:29.345', '2026-04-08 23:56:29.466', NULL, '2026-04-08 23:56:29.462');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqpiu6h0059eyngqexo2rkf', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-08 23:56:33.738', '2026-04-08 23:56:33.76', NULL, '2026-04-08 23:56:33.756');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqqc9ce005feynggplxafww', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-09 00:19:26.414', '2026-04-09 00:19:26.462', NULL, '2026-04-09 00:19:26.449');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnqs51q2005teyngj3qdotvl', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-09 01:09:49.178', '2026-04-09 01:09:49.187', NULL, '2026-04-09 01:09:49.185');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnr682e40063eyng1rfw17g8', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-09 07:44:04.636', '2026-04-09 07:44:04.708', NULL, '2026-04-09 07:44:04.701');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnr68qfu006leyng3zgkfkkt', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-09 07:44:35.802', '2026-04-09 07:44:35.854', NULL, '2026-04-09 07:44:35.847');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnrbt8wc0005eymw3ga78qpx', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-09 10:20:30.924', '2026-04-09 10:20:31.08', NULL, '2026-04-09 10:20:31.071');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnrce5j0000reymw38fkmhp5', 'cmnnnw8ab0001eyrkejds4lph', 'COMPLETED', 'طلب من شاشة POS', '2026-04-09 10:36:46.333', '2026-04-09 10:36:46.421', NULL, '2026-04-09 10:36:46.417');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnxge61q000reym4kgnwm85j', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-13 17:15:22.526', '2026-04-13 17:15:22.618', NULL, '2026-04-13 17:15:22.615');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnvnhcyv000peywofsosifal', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-12 10:58:16.424', '2026-04-12 10:58:16.461', NULL, '2026-04-12 10:58:16.459');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnxbcxtr0002eym45zuiedey', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-13 14:54:27.133', '2026-04-13 14:54:27.292', NULL, '2026-04-13 14:54:27.284');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnxgvsts000xeym4psnazub4', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-13 17:29:05.2', '2026-04-13 17:29:05.262', NULL, '2026-04-13 17:29:05.254');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnxdzkjq0008eym4bh8jfd11', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-13 16:08:02.246', '2026-04-13 16:08:02.282', NULL, '2026-04-13 16:08:02.28');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnxhgp9r001ceym441gvd7n6', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-13 17:45:20.365', '2026-04-13 17:45:20.437', NULL, '2026-04-13 17:45:20.427');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnxhh1yu001ieym4tonzsb7x', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-13 17:45:36.823', '2026-04-13 17:45:36.864', NULL, '2026-04-13 17:45:36.854');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnxpt0u40001eyr0lia5l00s', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-13 21:38:52.154', '2026-04-13 21:38:52.2', NULL, '2026-04-13 21:38:52.191');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnxptuyy0007eyr0ppvdz5wv', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-13 21:39:31.21', '2026-04-13 21:39:31.242', NULL, '2026-04-13 21:39:31.24');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmnyqmw2s0001eyxkldvofyaj', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب من شاشة POS', '2026-04-14 14:49:51.842', '2026-04-14 14:49:51.945', NULL, '2026-04-14 14:49:51.94');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo1ta6610001eyusn867hgla', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-16 18:27:15.767', '2026-04-16 18:27:15.859', NULL, '2026-04-16 18:27:15.857');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo1tazth0007eyush7lr8u4m', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-16 18:27:54.198', '2026-04-16 18:27:54.232', NULL, '2026-04-16 18:27:54.23');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo4a8zzy0017eyusqoqt36ln', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-18 11:57:46.942', '2026-04-18 11:57:47.083', NULL, '2026-04-18 11:57:47.075');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo50omgl0001eyqoppt7z629', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-19 00:17:45.907', '2026-04-19 00:17:46.018', NULL, '2026-04-19 00:17:46.016');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo6br2360001ey10qx2t9mmo', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-19 22:15:21.424', '2026-04-19 22:15:21.537', NULL, '2026-04-19 22:15:21.536');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo6brm7v000jey108udvgm8i', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-19 22:15:47.515', '2026-04-19 22:15:47.553', NULL, '2026-04-19 22:15:47.552');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo6cldv1000rey109ml3mmjz', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-19 22:38:56.364', '2026-04-19 22:38:56.461', NULL, '2026-04-19 22:38:56.458');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo6cnehs0019ey10bof9qoqh', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-19 22:40:30.497', '2026-04-19 22:40:30.525', NULL, '2026-04-19 22:40:30.523');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo6f815e001hey10e9xung2q', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-19 23:52:32.21', '2026-04-19 23:52:32.358', NULL, '2026-04-19 23:52:32.355');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo6fgwqt001zey10l5dgt2ae', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-19 23:59:26.406', '2026-04-19 23:59:26.569', NULL, '2026-04-19 23:59:26.563');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo6g46ze002hey1046qur00s', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-20 00:17:32.762', '2026-04-20 00:17:32.846', NULL, '2026-04-20 00:17:32.843');
INSERT INTO public."Order" (id, "businessId", status, notes, "createdAt", "updatedAt", "archivedAt", "completedAt") VALUES ('cmo6g6gdx002pey10ce89998j', 'cmnvn3gi30001eywonooiglki', 'COMPLETED', 'طلب نقطة البيع', '2026-04-20 00:19:18.262', '2026-04-20 00:19:18.294', NULL, '2026-04-20 00:19:18.289');


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Product" (id, "businessId", code, "nameAr", "nameEn", "categoryId", "basePrice", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnnq2tcm0009ey74k8wrcp2i', 'cmnnnw8ab0001eyrkejds4lph', 'espresso', 'إسبريسو', 'Espresso', 'cmnnpu42g0001ey74vp0tq7wm', 3.00, true, '2026-04-06 21:48:47.254', '2026-04-06 21:48:47.254', NULL);
INSERT INTO public."Product" (id, "businessId", code, "nameAr", "nameEn", "categoryId", "basePrice", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnowp7hq0011eygce1wksl7n', 'cmnnnw8ab0001eyrkejds4lph', 'cappuccino', 'كابتشينو', 'Cappuccino', 'cmnnpu42g0001ey74vp0tq7wm', 6.00, true, '2026-04-07 17:41:55.885', '2026-04-07 17:41:55.885', NULL);
INSERT INTO public."Product" (id, "businessId", code, "nameAr", "nameEn", "categoryId", "basePrice", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnqs3n95005reyng85b0riou', 'cmnnnw8ab0001eyrkejds4lph', 'latte', 'لاتيه', 'Latte', 'cmnnpu42g0001ey74vp0tq7wm', 8.00, true, '2026-04-09 01:08:43.767', '2026-04-09 01:08:43.767', NULL);
INSERT INTO public."Product" (id, "businessId", code, "nameAr", "nameEn", "categoryId", "basePrice", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnvndet6000feywohds1475b', 'cmnvn3gi30001eywonooiglki', 'espresso', 'إسبريسو', 'Espresso', 'cmnvn6ibm0007eywoa3352kb6', 3.00, true, '2026-04-12 10:55:12.186', '2026-04-12 10:55:12.186', NULL);
INSERT INTO public."Product" (id, "businessId", code, "nameAr", "nameEn", "categoryId", "basePrice", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmo1tjcpi000heyusljuvgz6j', 'cmnvn3gi30001eywonooiglki', 'iced-latte', 'اَيس لاتيه', 'Iced Latte', 'cmo1tglik000feyusss7ty6on', 8.00, true, '2026-04-16 18:34:24.151', '2026-04-16 18:34:24.151', NULL);
INSERT INTO public."Product" (id, "businessId", code, "nameAr", "nameEn", "categoryId", "basePrice", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmo1tf5h8000deyustnvrfoo5', 'cmnvn3gi30001eywonooiglki', 'cappuccino', 'كابتشينو', 'Cappuccino', 'cmnvn6ibm0007eywoa3352kb6', 7.00, true, '2026-04-16 18:31:08.156', '2026-04-20 00:06:01.004', NULL);


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnoaujie0005eyd4s7jdoxl8', 'cmnoat6t00001eyd42j2jiehf', 'cmnnq2tcm0009ey74k8wrcp2i', 2.000, '2026-04-07 07:30:13.191');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnob4q9v000beyd4sciqrnxt', 'cmnob48c00009eyd461uhjx5c', 'cmnnq2tcm0009ey74k8wrcp2i', 3.000, '2026-04-07 07:38:08.515');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnob4xax000deyd4t9rcvenj', 'cmnob48c00009eyd461uhjx5c', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-07 07:38:17.625');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnob5270000feyd4beoov12b', 'cmnob48c00009eyd461uhjx5c', 'cmnnq2tcm0009ey74k8wrcp2i', 6.000, '2026-04-07 07:38:23.964');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnok99pq0001eygc0nmns9bq', 'cmnob60bs000neyd4783sohxj', 'cmnnq2tcm0009ey74k8wrcp2i', 9.000, '2026-04-07 11:53:36.876');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnok9oqd0003eygcxobgu96d', 'cmnob60bs000neyd4783sohxj', 'cmnnq2tcm0009ey74k8wrcp2i', 2.000, '2026-04-07 11:53:56.341');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnonqfe10007eygczz4nj9kb', 'cmnonq66d0005eygcxtmu6pa5', 'cmnnq2tcm0009ey74k8wrcp2i', 5.000, '2026-04-07 13:30:56.234');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnoo2lw6000deygcfd29l5pn', 'cmnoo2d73000beygc9wkxcuqp', 'cmnnq2tcm0009ey74k8wrcp2i', 7.000, '2026-04-07 13:40:24.534');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnou0344000leygckd2xqje1', 'cmnou033z000jeygcpnsriwlo', 'cmnnq2tcm0009ey74k8wrcp2i', 4.000, '2026-04-07 16:26:24.58');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnou0sly000reygci33ohkf9', 'cmnou0slw000peygco0w8ijje', 'cmnnq2tcm0009ey74k8wrcp2i', 2.000, '2026-04-07 16:26:57.623');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnou1mq3000xeygcjrnnnqa1', 'cmnou1mpy000veygcxpzy31f6', 'cmnnq2tcm0009ey74k8wrcp2i', 26.000, '2026-04-07 16:27:36.652');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnox34pw001jeygca40ryc1i', 'cmnox34pu001heygcj3sizbsn', 'cmnnq2tcm0009ey74k8wrcp2i', 4.000, '2026-04-07 17:52:45.476');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnox34py001leygcll7it7jc', 'cmnox34pu001heygcj3sizbsn', 'cmnowp7hq0011eygce1wksl7n', 4.000, '2026-04-07 17:52:45.478');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnox4ry9001xeygcqfxw7pst', 'cmnox4ry8001veygcct4o749c', 'cmnowp7hq0011eygce1wksl7n', 12.000, '2026-04-07 17:54:02.242');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnox4ryc001zeygcfwc9op4l', 'cmnox4ry8001veygcct4o749c', 'cmnnq2tcm0009ey74k8wrcp2i', 7.000, '2026-04-07 17:54:02.244');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnpxhmf00029eygc1cpm3dky', 'cmnpxhmex0027eygcltt60n4a', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 10:51:47.772');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnpxhmf3002beygc94e6zemt', 'cmnpxhmex0027eygcltt60n4a', 'cmnowp7hq0011eygce1wksl7n', 6.000, '2026-04-08 10:51:47.775');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnpy5hka0003ey8oofo6fqaq', 'cmnpy5hk70001ey8ook4sa6ac', 'cmnnq2tcm0009ey74k8wrcp2i', 3.000, '2026-04-08 11:10:21.226');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnpy5hkc0005ey8oso58n5on', 'cmnpy5hk70001ey8ook4sa6ac', 'cmnowp7hq0011eygce1wksl7n', 4.000, '2026-04-08 11:10:21.228');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnpy5md6000fey8o2ezx9l8f', 'cmnpy5md5000dey8o0xg9yge8', 'cmnnq2tcm0009ey74k8wrcp2i', 3.000, '2026-04-08 11:10:27.45');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnpy5md7000hey8oakszigwl', 'cmnpy5md5000dey8o0xg9yge8', 'cmnowp7hq0011eygce1wksl7n', 4.000, '2026-04-08 11:10:27.452');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnpy5o7u000rey8ov291qws4', 'cmnpy5o7s000pey8oshlocxrz', 'cmnnq2tcm0009ey74k8wrcp2i', 3.000, '2026-04-08 11:10:29.85');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnpy5o7v000tey8o8elp2ycn', 'cmnpy5o7s000pey8oshlocxrz', 'cmnowp7hq0011eygce1wksl7n', 4.000, '2026-04-08 11:10:29.851');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq0r0xy0003eym8j5hx2mhe', 'cmnq0r0xo0001eym8jhsuteux', 'cmnnq2tcm0009ey74k8wrcp2i', 6.000, '2026-04-08 12:23:05.35');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq0r0y10005eym8u5dg5vyj', 'cmnq0r0xo0001eym8jhsuteux', 'cmnowp7hq0011eygce1wksl7n', 4.000, '2026-04-08 12:23:05.353');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq0y1r2000feym86byl0scp', 'cmnq0y1r0000deym8axs8r1mh', 'cmnnq2tcm0009ey74k8wrcp2i', 22.000, '2026-04-08 12:28:32.99');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq0y1r4000heym8ymz6tfii', 'cmnq0y1r0000deym8axs8r1mh', 'cmnowp7hq0011eygce1wksl7n', 13.000, '2026-04-08 12:28:32.993');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq1slwc000reym8lmi77b5g', 'cmnq1slwa000peym8odqkxfpq', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 12:52:18.78');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq1slwe000teym8xb3wd74y', 'cmnq1slwa000peym8odqkxfpq', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 12:52:18.782');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq2pdhd0013eym8pov0j162', 'cmnq2pdh90011eym8mqy5sx35', 'cmnnq2tcm0009ey74k8wrcp2i', 2.000, '2026-04-08 13:17:47.521');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq2pdhh0015eym8nhsuhxjt', 'cmnq2pdh90011eym8mqy5sx35', 'cmnowp7hq0011eygce1wksl7n', 3.000, '2026-04-08 13:17:47.525');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq2y1fa0003eyhgnj71meft', 'cmnq2y1f70001eyhgg3p8ra84', 'cmnnq2tcm0009ey74k8wrcp2i', 3.000, '2026-04-08 13:24:31.799');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq2y1fg0005eyhg3shr1443', 'cmnq2y1f70001eyhgg3p8ra84', 'cmnowp7hq0011eygce1wksl7n', 25.000, '2026-04-08 13:24:31.804');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq2zjw1000feyhgpidrbwyk', 'cmnq2zjw0000deyhgebghq8x7', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 13:25:42.385');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq2zjw2000heyhg4nfd94xj', 'cmnq2zjw0000deyhgebghq8x7', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 13:25:42.387');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq3aj5z000reyhgt1mh1yj7', 'cmnq3aj5x000peyhggh3zuv03', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 13:34:14.664');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq5vw870003eyy4lpx17n17', 'cmnq5vw7x0001eyy425suqpp9', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 14:46:50.6');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq5vw8a0005eyy4han52bn6', 'cmnq5vw7x0001eyy425suqpp9', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 14:46:50.602');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq5ykmg000feyy4rqfc3827', 'cmnq5ykmd000deyy42jn7vnqi', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 14:48:55.529');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq5yupw000leyy4phe3a48i', 'cmnq5yupv000jeyy4tgn5lft5', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 14:49:08.613');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq5yupy000neyy4t03gds0d', 'cmnq5yupv000jeyy4tgn5lft5', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 14:49:08.614');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq78xbi000xeyy4ivftxa18', 'cmnq78xbf000veyy4xzi84vtn', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 15:24:58.158');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq78xbl000zeyy4yy34glj9', 'cmnq78xbf000veyy4xzi84vtn', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 15:24:58.161');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq79iqk0019eyy4i2u6nby3', 'cmnq79iqh0017eyy451ibbv49', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 15:25:25.916');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq79iqm001beyy4fpcs015a', 'cmnq79iqh0017eyy451ibbv49', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 15:25:25.918');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq79xat001leyy4vlnfwfdx', 'cmnq79xaq001jeyy4nbyl4xoh', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 15:25:44.789');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq79xax001neyy4n3bubeep', 'cmnq79xaq001jeyy4nbyl4xoh', 'cmnowp7hq0011eygce1wksl7n', 14.000, '2026-04-08 15:25:44.793');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq8t6uc001xeyy4l77ie9wx', 'cmnq8t6u9001veyy4csv8xcbl', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 16:08:43.236');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnq8t6uf001zeyy41zak7bay', 'cmnq8t6u9001veyy4csv8xcbl', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 16:08:43.239');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqavcpy0029eyy498xe7ppk', 'cmnqavcpt0027eyy4epyibx7f', 'cmnowp7hq0011eygce1wksl7n', 50.000, '2026-04-08 17:06:23.399');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqavcq4002beyy4m3an8k7i', 'cmnqavcpt0027eyy4epyibx7f', 'cmnnq2tcm0009ey74k8wrcp2i', 20.000, '2026-04-08 17:06:23.404');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqayrhz002neyy4bv0osao7', 'cmnqayrhv002leyy472a51obo', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 17:09:02.519');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqb7m2n002teyy4cea03xvm', 'cmnqb7m2k002reyy408o6lnis', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 17:15:55.392');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqb7m2q002veyy48q12u70o', 'cmnqb7m2k002reyy408o6lnis', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 17:15:55.395');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqc4vz30002eyq0m1k1ihbu', 'cmnosrdg2000heygctsphg0ew', 'cmnnq2tcm0009ey74k8wrcp2i', 3.000, '2026-04-08 17:41:47.871');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqk4dqx0003eyo0lu7193w2', 'cmnqk3gvg0001eyo00spav5ix', 'cmnnq2tcm0009ey74k8wrcp2i', 3.000, '2026-04-08 21:25:21.178');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqmawqz0003eyngdepw3m50', 'cmnqmawqv0001eyng2wv55x4l', 'cmnowp7hq0011eygce1wksl7n', 4.000, '2026-04-08 22:26:24.971');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqmawr20005eyngbw8h61qa', 'cmnqmawqv0001eyng2wv55x4l', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 22:26:24.974');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqnb74a000feyng4tan7596', 'cmnqnb747000deyngf8qnfz4k', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 22:54:38.026');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqnb74e000heyngyssqwes9', 'cmnqnb747000deyngf8qnfz4k', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 22:54:38.03');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqnyb4w000reyngnw7r1aio', 'cmnqnyb4r000peynga0m2jaid', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 23:12:36.32');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqnyb52000teyngvbe9m85n', 'cmnqnyb4r000peynga0m2jaid', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 23:12:36.326');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqnywfj0013eyngzdj9y9wf', 'cmnqnywfg0011eyngqz18gqdp', 'cmnnq2tcm0009ey74k8wrcp2i', 7.000, '2026-04-08 23:13:03.919');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqnzcfl0019eyngr7da5100', 'cmnqnzcfj0017eyngt5mxnhkb', 'cmnnq2tcm0009ey74k8wrcp2i', 7.000, '2026-04-08 23:13:24.657');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqnzcfn001beyngrgc13eb0', 'cmnqnzcfj0017eyngt5mxnhkb', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 23:13:24.66');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqoanne001leyngximw6qdu', 'cmnqoanna001jeynga9pzs599', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 23:22:12.41');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqob33r001teyngxbrd87mo', 'cmnqob33p001reyngqj7x5xjo', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 23:22:32.44');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqob33t001veyng58iu025p', 'cmnqob33p001reyngqj7x5xjo', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 23:22:32.442');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqorcbc0025eyng3r11ffl7', 'cmnqorcb80023eynge7s5m5ji', 'cmnnq2tcm0009ey74k8wrcp2i', 5.000, '2026-04-08 23:35:10.872');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqorcbv0027eyngz7cbjsta', 'cmnqorcb80023eynge7s5m5ji', 'cmnowp7hq0011eygce1wksl7n', 3.000, '2026-04-08 23:35:10.891');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqotjpx002heyngx4knpvuh', 'cmnqotjpv002feynglo1lwlzy', 'cmnnq2tcm0009ey74k8wrcp2i', 5.000, '2026-04-08 23:36:53.781');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqotjpz002jeyng0i9mlpfp', 'cmnqotjpv002feynglo1lwlzy', 'cmnowp7hq0011eygce1wksl7n', 3.000, '2026-04-08 23:36:53.783');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqotnfp002teyngnjzt1oy6', 'cmnqotnfm002reynga4qa11xm', 'cmnnq2tcm0009ey74k8wrcp2i', 5.000, '2026-04-08 23:36:58.597');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqotnfr002veynghsfl6xp4', 'cmnqotnfm002reynga4qa11xm', 'cmnowp7hq0011eygce1wksl7n', 3.000, '2026-04-08 23:36:58.6');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqotoh40035eyng4f8suqxy', 'cmnqotoh20033eyngxivv1xk5', 'cmnnq2tcm0009ey74k8wrcp2i', 5.000, '2026-04-08 23:36:59.944');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqotoh50037eyngzr95579e', 'cmnqotoh20033eyngxivv1xk5', 'cmnowp7hq0011eygce1wksl7n', 3.000, '2026-04-08 23:36:59.946');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqotpuq003heyngvk08qjxg', 'cmnqotpun003feyngb54vhj7g', 'cmnnq2tcm0009ey74k8wrcp2i', 5.000, '2026-04-08 23:37:01.73');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqotpus003jeyngwifal32h', 'cmnqotpun003feyngb54vhj7g', 'cmnowp7hq0011eygce1wksl7n', 3.000, '2026-04-08 23:37:01.733');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpb6t9003teyng6g0hnmsr', 'cmnqpb6t3003reyngk3tk9vew', 'cmnnq2tcm0009ey74k8wrcp2i', 3.000, '2026-04-08 23:50:36.861');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpb6tg003veyngk5s6hgsz', 'cmnqpb6t3003reyngk3tk9vew', 'cmnowp7hq0011eygce1wksl7n', 3.000, '2026-04-08 23:50:36.869');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpcezl0045eyngfeh6p5to', 'cmnqpcezi0043eyng2hxr3lg5', 'cmnowp7hq0011eygce1wksl7n', 15.000, '2026-04-08 23:51:34.113');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpdzgi004deyng7rdqj0fu', 'cmnqpdzgf004beyngtfjm1mir', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-08 23:52:47.298');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpelcb004leyngpkxr029g', 'cmnqpelc7004jeyngsesms3z7', 'cmnnq2tcm0009ey74k8wrcp2i', 2.000, '2026-04-08 23:53:15.659');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpfyqn004reyng7w8rd9b7', 'cmnqpfyqk004peyngkvhepep3', 'cmnowp7hq0011eygce1wksl7n', 22.000, '2026-04-08 23:54:19.679');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpiqsl004zeyngrm02vxwv', 'cmnqpiqsg004xeyngrjc95wcy', 'cmnowp7hq0011eygce1wksl7n', 2.000, '2026-04-08 23:56:29.349');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpiqsq0051eyng1is63hfq', 'cmnqpiqsg004xeyngrjc95wcy', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-08 23:56:29.355');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqpiu6k005beyngeqguau3c', 'cmnqpiu6h0059eyngqexo2rkf', 'cmnnq2tcm0009ey74k8wrcp2i', 4.000, '2026-04-08 23:56:33.74');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqqc9cg005heyngeneve7hz', 'cmnqqc9ce005feynggplxafww', 'cmnowp7hq0011eygce1wksl7n', 3.000, '2026-04-09 00:19:26.416');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqqc9ci005jeynguuiil6yf', 'cmnqqc9ce005feynggplxafww', 'cmnnq2tcm0009ey74k8wrcp2i', 5.000, '2026-04-09 00:19:26.418');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnqs51q5005veyng2is46i2w', 'cmnqs51q2005teyngj3qdotvl', 'cmnqs3n95005reyng85b0riou', 1.000, '2026-04-09 01:09:49.181');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnr682e80065eyngcowjp4su', 'cmnr682e40063eyng1rfw17g8', 'cmnqs3n95005reyng85b0riou', 1.000, '2026-04-09 07:44:04.64');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnr682ec0067eyngi8fx29xl', 'cmnr682e40063eyng1rfw17g8', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-09 07:44:04.644');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnr682ed0069eyngw9ov6dfx', 'cmnr682e40063eyng1rfw17g8', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-09 07:44:04.646');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnr68qfv006neyngszn0s3rw', 'cmnr68qfu006leyng3zgkfkkt', 'cmnqs3n95005reyng85b0riou', 1.000, '2026-04-09 07:44:35.804');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnr68qfx006peyngxap53w43', 'cmnr68qfu006leyng3zgkfkkt', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-09 07:44:35.805');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnr68qfy006reyngh51cmuv5', 'cmnr68qfu006leyng3zgkfkkt', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-09 07:44:35.806');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnrbt8wh0007eymwcekye8a6', 'cmnrbt8wc0005eymw3ga78qpx', 'cmnnq2tcm0009ey74k8wrcp2i', 1.000, '2026-04-09 10:20:30.929');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnrbt8x70009eymw6ku6jkzu', 'cmnrbt8wc0005eymw3ga78qpx', 'cmnowp7hq0011eygce1wksl7n', 1.000, '2026-04-09 10:20:30.955');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnrbt8x9000beymwcsari1oj', 'cmnrbt8wc0005eymw3ga78qpx', 'cmnqs3n95005reyng85b0riou', 1.000, '2026-04-09 10:20:30.957');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnrce5j4000teymw90b8x7fj', 'cmnrce5j0000reymw38fkmhp5', 'cmnqs3n95005reyng85b0riou', 20.000, '2026-04-09 10:36:46.336');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnvnhcz5000reywo8jsz3jbi', 'cmnvnhcyv000peywofsosifal', 'cmnvndet6000feywohds1475b', 5.000, '2026-04-12 10:58:16.434');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnxbcxus0004eym4u1wmaobi', 'cmnxbcxtr0002eym45zuiedey', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-13 14:54:27.172');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnxdzkju000aeym4kmbqkxaw', 'cmnxdzkjq0008eym4bh8jfd11', 'cmnvndet6000feywohds1475b', 52.000, '2026-04-13 16:08:02.25');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnxge62d000teym438v1w8sp', 'cmnxge61q000reym4kgnwm85j', 'cmnvndet6000feywohds1475b', 5.000, '2026-04-13 17:15:22.549');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnxgvsuk000zeym46e2bq2vi', 'cmnxgvsts000xeym4psnazub4', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-13 17:29:05.223');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnxhgpak001eeym4vaqvoacb', 'cmnxhgp9r001ceym441gvd7n6', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-13 17:45:20.397');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnxhh1yx001keym4ff9dsr6l', 'cmnxhh1yu001ieym4tonzsb7x', 'cmnvndet6000feywohds1475b', 2.000, '2026-04-13 17:45:36.825');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnxpt0ua0003eyr005fsh4fx', 'cmnxpt0u40001eyr0lia5l00s', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-13 21:38:52.162');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnxptuz00009eyr0jgiasb4g', 'cmnxptuyy0007eyr0ppvdz5wv', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-13 21:39:31.212');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmnyqmw3i0003eyxkiom3q1vc', 'cmnyqmw2s0001eyxkldvofyaj', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-14 14:49:51.871');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo1ta66q0003eyusp25et2dc', 'cmo1ta6610001eyusn867hgla', 'cmnvndet6000feywohds1475b', 2.000, '2026-04-16 18:27:15.794');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo1taztk0009eyusry2ofijj', 'cmo1tazth0007eyush7lr8u4m', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-16 18:27:54.201');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo4a900k0019eyusdeq3ycry', 'cmo4a8zzy0017eyusqoqt36ln', 'cmo1tf5h8000deyustnvrfoo5', 1.000, '2026-04-18 11:57:46.965');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo4a9010001beyusybrin4jk', 'cmo4a8zzy0017eyusqoqt36ln', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-18 11:57:46.981');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo4a9012001deyusffx70cc3', 'cmo4a8zzy0017eyusqoqt36ln', 'cmo1tjcpi000heyusljuvgz6j', 1.000, '2026-04-18 11:57:46.983');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo50omh30003eyqoxqcq6l6v', 'cmo50omgl0001eyqoppt7z629', 'cmo1tf5h8000deyustnvrfoo5', 1.000, '2026-04-19 00:17:45.928');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo50omhi0005eyqoy96hdk9p', 'cmo50omgl0001eyqoppt7z629', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-19 00:17:45.942');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo50omhj0007eyqo0ap90407', 'cmo50omgl0001eyqoppt7z629', 'cmo1tjcpi000heyusljuvgz6j', 1.000, '2026-04-19 00:17:45.944');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6br23o0003ey10elln5tdg', 'cmo6br2360001ey10qx2t9mmo', 'cmo1tf5h8000deyustnvrfoo5', 1.000, '2026-04-19 22:15:21.445');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6br2410005ey10f72ddyd2', 'cmo6br2360001ey10qx2t9mmo', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-19 22:15:21.457');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6br2420007ey10isx4eh9d', 'cmo6br2360001ey10qx2t9mmo', 'cmo1tjcpi000heyusljuvgz6j', 1.000, '2026-04-19 22:15:21.458');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6brm7x000ley104iqfyhfu', 'cmo6brm7v000jey108udvgm8i', 'cmo1tf5h8000deyustnvrfoo5', 10.000, '2026-04-19 22:15:47.517');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6cldv8000tey10hvi74oji', 'cmo6cldv1000rey109ml3mmjz', 'cmo1tf5h8000deyustnvrfoo5', 1.000, '2026-04-19 22:38:56.373');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6cldve000vey109hqotcg2', 'cmo6cldv1000rey109ml3mmjz', 'cmnvndet6000feywohds1475b', 1.000, '2026-04-19 22:38:56.378');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6cldvf000xey10c8etn7ks', 'cmo6cldv1000rey109ml3mmjz', 'cmo1tjcpi000heyusljuvgz6j', 1.000, '2026-04-19 22:38:56.379');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6cnehu001bey10d29gvqpl', 'cmo6cnehs0019ey10bof9qoqh', 'cmo1tf5h8000deyustnvrfoo5', 1.000, '2026-04-19 22:40:30.498');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6f815j001jey10wbpu2sjj', 'cmo6f815e001hey10e9xung2q', 'cmo1tf5h8000deyustnvrfoo5', 3.000, '2026-04-19 23:52:32.215');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6f815n001ley10juj8zv1f', 'cmo6f815e001hey10e9xung2q', 'cmo1tjcpi000heyusljuvgz6j', 1.000, '2026-04-19 23:52:32.219');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6f815p001ney10ynedoucz', 'cmo6f815e001hey10e9xung2q', 'cmnvndet6000feywohds1475b', 5.000, '2026-04-19 23:52:32.221');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6fgwqz0021ey10cz1r3o64', 'cmo6fgwqt001zey10l5dgt2ae', 'cmo1tf5h8000deyustnvrfoo5', 4.000, '2026-04-19 23:59:26.411');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6fgwr30023ey10amyn6f6w', 'cmo6fgwqt001zey10l5dgt2ae', 'cmnvndet6000feywohds1475b', 3.000, '2026-04-19 23:59:26.415');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6fgwrs0025ey10safvsizk', 'cmo6fgwqt001zey10l5dgt2ae', 'cmo1tjcpi000heyusljuvgz6j', 2.000, '2026-04-19 23:59:26.441');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6g46zh002jey10aya5wevj', 'cmo6g46ze002hey1046qur00s', 'cmo1tf5h8000deyustnvrfoo5', 1.000, '2026-04-20 00:17:32.766');
INSERT INTO public."OrderItem" (id, "orderId", "productId", quantity, "createdAt") VALUES ('cmo6g6ge0002rey106d6vetme', 'cmo6g6gdx002pey10ce89998j', 'cmo1tf5h8000deyustnvrfoo5', 1.000, '2026-04-20 00:19:18.265');


--
-- Data for Name: Plan; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Plan" (id, code, "nameAr", "nameEn", price, "branchLimit", "staffLimit", "isActive", "createdAt", "updatedAt") VALUES ('cmnqcz77s0005eyq03tetdvum', 'starter-default', 'الباقة الأساسية', 'Starter', 0.00, 3, 10, true, '2026-04-08 18:05:22.12', '2026-04-08 18:05:22.12');


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Subscription" (id, "businessId", "planId", status, "startsAt", "trialEndsAt", "endsAt", "canceledAt", "createdAt", "updatedAt", "archivedAt", "billingCycle", "chargedAmount", currency, "monthlyPrice") VALUES ('cmnqcz79a000beyq0b6433wop', 'cmnqcz7930007eyq0eqlmq8tp', 'cmnqcz77s0005eyq03tetdvum', 'TRIALING', '2026-04-08 18:05:22.167', '2026-04-22 18:05:22.167', NULL, NULL, '2026-04-08 18:05:22.174', '2026-04-08 18:05:22.174', NULL, 'MONTHLY', 0.00, 'د.ل', 0.00);
INSERT INTO public."Subscription" (id, "businessId", "planId", status, "startsAt", "trialEndsAt", "endsAt", "canceledAt", "createdAt", "updatedAt", "archivedAt", "billingCycle", "chargedAmount", currency, "monthlyPrice") VALUES ('cmnvn3gih0005eywogk4mj311', 'cmnvn3gi30001eywonooiglki', 'cmnqcz77s0005eyq03tetdvum', 'TRIALING', '2026-04-12 10:47:27.83', '2026-04-26 10:47:27.83', NULL, NULL, '2026-04-12 10:47:27.833', '2026-04-12 10:47:27.833', NULL, 'MONTHLY', 0.00, 'د.ل', 0.00);


--
-- Data for Name: PaymentRequest; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Supplier" (id, "businessId", name, phone, email, notes, "createdAt", "updatedAt", "archivedAt") VALUES ('cmnnpybcw0005ey74dm3itl6q', 'cmnnnw8ab0001eyrkejds4lph', 'ايمن بن', '0921234567', 'aiman@c.com', 'مورد بن الاسبريسو', '2026-04-06 21:45:17.312', '2026-04-06 21:45:17.312', NULL);
INSERT INTO public."Supplier" (id, "businessId", name, phone, email, notes, "createdAt", "updatedAt", "archivedAt") VALUES ('cmnvn9dzw000beywokutd5xfq', 'cmnvn3gi30001eywonooiglki', 'علاء للبن', '0959876542', 'alaabon@cofe.com', NULL, '2026-04-12 10:52:04.508', '2026-04-12 10:52:04.508', NULL);


--
-- Data for Name: Unit; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Unit" (id, "businessId", code, "nameAr", "nameEn", symbol, "createdAt", "updatedAt", "archivedAt") VALUES ('cmnnpwy9x0003ey74m0jjtlam', 'cmnnnw8ab0001eyrkejds4lph', 'kg', 'كيلو', NULL, 'kg', '2026-04-06 21:44:13.702', '2026-04-06 21:44:13.702', NULL);
INSERT INTO public."Unit" (id, "businessId", code, "nameAr", "nameEn", symbol, "createdAt", "updatedAt", "archivedAt") VALUES ('cmnowubx60017eygckazvxhrw', 'cmnnnw8ab0001eyrkejds4lph', 'ml', 'مل', 'ml', 'مل', '2026-04-07 17:45:54.906', '2026-04-07 17:45:54.906', NULL);
INSERT INTO public."Unit" (id, "businessId", code, "nameAr", "nameEn", symbol, "createdAt", "updatedAt", "archivedAt") VALUES ('cmnvn7qfw0009eywoq4090rk4', 'cmnvn3gi30001eywonooiglki', 'kg', 'كيلو', 'kg', 'كيلو', '2026-04-12 10:50:47.325', '2026-04-12 10:50:47.325', NULL);
INSERT INTO public."Unit" (id, "businessId", code, "nameAr", "nameEn", symbol, "createdAt", "updatedAt", "archivedAt") VALUES ('cmo1tsvjv000reyusofy8ftda', 'cmnvn3gi30001eywonooiglki', 'ml', 'مل', 'ml', 'مل', '2026-04-16 18:41:48.476', '2026-04-16 18:41:48.476', NULL);


--
-- Data for Name: RawMaterial; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."RawMaterial" (id, "businessId", code, "nameAr", "nameEn", "unitId", "supplierId", "costPerUnit", "minimumQuantity", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnnq13u00007ey74q96xba8j', 'cmnnnw8ab0001eyrkejds4lph', 'espresso-beans', 'بن الإسبريسو', 'Espresso Beans', 'cmnnpwy9x0003ey74m0jjtlam', 'cmnnpybcw0005ey74dm3itl6q', 55.0000, 5, true, '2026-04-06 21:47:27.528', '2026-04-06 21:47:27.528', NULL);
INSERT INTO public."RawMaterial" (id, "businessId", code, "nameAr", "nameEn", "unitId", "supplierId", "costPerUnit", "minimumQuantity", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnowvhlb0019eygcnagu326r', 'cmnnnw8ab0001eyrkejds4lph', 'milk', 'حليب', 'Milk', 'cmnowubx60017eygckazvxhrw', NULL, 5.0000, 10, true, '2026-04-07 17:46:48.91', '2026-04-07 17:46:48.91', NULL);
INSERT INTO public."RawMaterial" (id, "businessId", code, "nameAr", "nameEn", "unitId", "supplierId", "costPerUnit", "minimumQuantity", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmnvnbgim000deywofoj1yaf0', 'cmnvn3gi30001eywonooiglki', 'espresso-beans', 'بن الإسبريسو', 'Espresso Beans', 'cmnvn7qfw0009eywoq4090rk4', 'cmnvn9dzw000beywokutd5xfq', 55.0000, 5, true, '2026-04-12 10:53:41.086', '2026-04-13 16:07:33.077', NULL);
INSERT INTO public."RawMaterial" (id, "businessId", code, "nameAr", "nameEn", "unitId", "supplierId", "costPerUnit", "minimumQuantity", "isActive", "createdAt", "updatedAt", "archivedAt") VALUES ('cmo1trsdw000peyusiyrs8qaz', 'cmnvn3gi30001eywonooiglki', 'milk', 'حليب', 'Milk', 'cmo1tsvjv000reyusofy8ftda', NULL, 5.0000, 10, true, '2026-04-16 18:40:57.716', '2026-04-16 18:42:16.448', NULL);


--
-- Data for Name: RawMaterialStock; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."RawMaterialStock" (id, "businessId", "rawMaterialId", balance, "updatedAt") VALUES ('cmno9cdnm0005ey8wktqgtx5b', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 7.3590, '2026-04-09 10:39:45.64');
INSERT INTO public."RawMaterialStock" (id, "businessId", "rawMaterialId", balance, "updatedAt") VALUES ('cmnvnh63t000leywo3wmfyuj1', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 5.9120, '2026-04-20 00:19:18.281');
INSERT INTO public."RawMaterialStock" (id, "businessId", "rawMaterialId", balance, "updatedAt") VALUES ('cmo4a6r680011eyusqcloj27q', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 11.0700, '2026-04-20 00:19:18.29');
INSERT INTO public."RawMaterialStock" (id, "businessId", "rawMaterialId", balance, "updatedAt") VALUES ('cmnowx8mq001beygc60o8rvkn', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 28.4700, '2026-04-09 10:36:46.414');


--
-- Data for Name: Recipe; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Recipe" (id, "businessId", "productId", notes, "createdAt", "updatedAt") VALUES ('cmno96vtx0001ey8weny0npcr', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq2tcm0009ey74k8wrcp2i', NULL, '2026-04-07 06:43:49.797', '2026-04-07 06:43:49.797');
INSERT INTO public."Recipe" (id, "businessId", "productId", notes, "createdAt", "updatedAt") VALUES ('cmnowqesw0013eygch31aenba', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowp7hq0011eygce1wksl7n', NULL, '2026-04-07 17:42:52.016', '2026-04-07 17:42:52.016');
INSERT INTO public."Recipe" (id, "businessId", "productId", notes, "createdAt", "updatedAt") VALUES ('cmnr65hkw005xeyngro8abkn6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnqs3n95005reyng85b0riou', NULL, '2026-04-09 07:42:04.353', '2026-04-09 07:42:04.353');
INSERT INTO public."Recipe" (id, "businessId", "productId", notes, "createdAt", "updatedAt") VALUES ('cmnvndz7r000heywo8mq091vb', 'cmnvn3gi30001eywonooiglki', 'cmnvndet6000feywohds1475b', NULL, '2026-04-12 10:55:38.632', '2026-04-12 10:55:38.632');
INSERT INTO public."Recipe" (id, "businessId", "productId", notes, "createdAt", "updatedAt") VALUES ('cmo1tqda0000leyusef13f3mz', 'cmnvn3gi30001eywonooiglki', 'cmo1tf5h8000deyustnvrfoo5', NULL, '2026-04-16 18:39:51.481', '2026-04-16 18:39:51.481');
INSERT INTO public."Recipe" (id, "businessId", "productId", notes, "createdAt", "updatedAt") VALUES ('cmo1tvn81000veyusftgntgvy', 'cmnvn3gi30001eywonooiglki', 'cmo1tjcpi000heyusljuvgz6j', NULL, '2026-04-16 18:43:57.65', '2026-04-16 18:43:57.65');


--
-- Data for Name: RecipeItem; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmno99zxm0003ey8w7o0cq255', 'cmno96vtx0001ey8weny0npcr', 'cmnnq13u00007ey74q96xba8j', 0.018000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmnowsseb0015eygc7itbbaeq', 'cmnowqesw0013eygch31aenba', 'cmnnq13u00007ey74q96xba8j', 0.018000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmnox26qv001feygc36xknucs', 'cmnowqesw0013eygch31aenba', 'cmnowvhlb0019eygcnagu326r', 0.120000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmnr65ozh005zeyngl1kel2jq', 'cmnr65hkw005xeyngro8abkn6', 'cmnnq13u00007ey74q96xba8j', 0.018000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmnr66bn90061eyngech3g8mb', 'cmnr65hkw005xeyngro8abkn6', 'cmnowvhlb0019eygcnagu326r', 0.150000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmnvne55y000jeywolyy71wsn', 'cmnvndz7r000heywo8mq091vb', 'cmnvnbgim000deywofoj1yaf0', 0.018000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmo1tqmmo000neyusu9ojco3z', 'cmo1tqda0000leyusef13f3mz', 'cmnvnbgim000deywofoj1yaf0', 0.018000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmo1ttxrl000teyusl4ehxyh7', 'cmo1tqda0000leyusef13f3mz', 'cmo1trsdw000peyusiyrs8qaz', 0.120000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmo1tvt4f000xeyus482iinxm', 'cmo1tvn81000veyusftgntgvy', 'cmnvnbgim000deywofoj1yaf0', 0.018000);
INSERT INTO public."RecipeItem" (id, "recipeId", "rawMaterialId", quantity) VALUES ('cmo1tw15u000zeyuskjn95b5m', 'cmo1tvn81000veyusftgntgvy', 'cmo1trsdw000peyusiyrs8qaz', 0.150000);


--
-- Data for Name: StaffInvite; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."StaffInvite" (id, "businessId", email, role, scope, "branchId", "grantedPermissions", "revokedPermissions", status, "invitedByUserId", "expiresAt", "acceptedAt", "createdAt", "updatedAt", "templateKey", note, "cancelledAt", "tokenHash", "publicInviteLabel", "contactEmail", "contactPhone") VALUES ('cmnwaq7ec0001eyi0zmmnc89x', 'cmnvn3gi30001eywonooiglki', 'ragab.mahmoud.cashier@omarcafe.cafeflow.local', 'CASHIER', 'BRANCH_ONLY', 'cmnvnte4k000veywo5s6oodzp', '{}', '{}', 'ACCEPTED', 'cmnocmubb0000eyh4r1qtqnxr', '2026-04-19 21:49:00.255', '2026-04-12 22:14:01.923', '2026-04-12 21:49:00.274', '2026-04-12 22:14:02.296', 'DEFAULT', NULL, NULL, '1938a6c2cb3ef326b1b6b4a73da1e98b153ff627d20bc751bb496ac4dbe5f694', 'invite-cashier-4f576d', NULL, NULL);
INSERT INTO public."StaffInvite" (id, "businessId", email, role, scope, "branchId", "grantedPermissions", "revokedPermissions", status, "invitedByUserId", "expiresAt", "acceptedAt", "createdAt", "updatedAt", "templateKey", note, "cancelledAt", "tokenHash", "publicInviteLabel", "contactEmail", "contactPhone") VALUES ('cmnwc4t1k000aeyi04diaa4ns', 'cmnvn3gi30001eywonooiglki', 'mohamed.tarek.barista@omarcafe.cafeflow.local', 'BARISTA', 'BRANCH_ONLY', 'cmnvnte4k000veywo5s6oodzp', '{}', '{}', 'ACCEPTED', 'cmnocmubb0000eyh4r1qtqnxr', '2026-04-19 22:28:21.109', '2026-04-12 22:29:14.388', '2026-04-12 22:28:21.128', '2026-04-12 22:29:14.787', 'DEFAULT', NULL, NULL, '6c4e62e39368fb70c3482a1402f6509cc85c0d82adf5c664818920b0687f50f9', 'invite-barista-053cbf', NULL, NULL);
INSERT INTO public."StaffInvite" (id, "businessId", email, role, scope, "branchId", "grantedPermissions", "revokedPermissions", status, "invitedByUserId", "expiresAt", "acceptedAt", "createdAt", "updatedAt", "templateKey", note, "cancelledAt", "tokenHash", "publicInviteLabel", "contactEmail", "contactPhone") VALUES ('cmnwcxf94000jeyi0lm6k18ip', 'cmnvn3gi30001eywonooiglki', 'hussien.benghzi.manager@omarcafe.cafeflow.local', 'MANAGER', 'BRANCH_ONLY', 'cmnvnte4k000veywo5s6oodzp', '{}', '{}', 'ACCEPTED', 'cmnocmubb0000eyh4r1qtqnxr', '2026-04-19 22:50:36.245', '2026-04-12 22:51:31.219', '2026-04-12 22:50:36.28', '2026-04-12 22:51:31.854', 'DEFAULT', NULL, NULL, '131166332f130e711a9cec90f4e3d02fd20c472e776cbce429887e2fcf4c7d6c', 'invite-manager-207dd0', NULL, NULL);
INSERT INTO public."StaffInvite" (id, "businessId", email, role, scope, "branchId", "grantedPermissions", "revokedPermissions", status, "invitedByUserId", "expiresAt", "acceptedAt", "createdAt", "updatedAt", "templateKey", note, "cancelledAt", "tokenHash", "publicInviteLabel", "contactEmail", "contactPhone") VALUES ('cmnwd4nqp000seyi07ltzq6wv', 'cmnvn3gi30001eywonooiglki', 'mohamed.elktaani.purchasing@omarcafe.cafeflow.local', 'PURCHASING_MANAGER', 'BRANCH_ONLY', 'cmnvnte4k000veywo5s6oodzp', '{}', '{}', 'ACCEPTED', 'cmnocmubb0000eyh4r1qtqnxr', '2026-04-19 22:56:13.846', '2026-04-12 23:14:37.656', '2026-04-12 22:56:13.873', '2026-04-12 23:14:38.258', 'DEFAULT', NULL, NULL, '80ea358c449feac3d5af3c0a86c4820a820f0b426cccdf2e420ffb05bb6fd5b1', 'invite-purchasing-36ce46', NULL, NULL);
INSERT INTO public."StaffInvite" (id, "businessId", email, role, scope, "branchId", "grantedPermissions", "revokedPermissions", status, "invitedByUserId", "expiresAt", "acceptedAt", "createdAt", "updatedAt", "templateKey", note, "cancelledAt", "tokenHash", "publicInviteLabel", "contactEmail", "contactPhone") VALUES ('cmnxgaq6h000ieym4vg3fqh5f', 'cmnvn3gi30001eywonooiglki', 'salih.alburesiu.cashier@omarcafe.cafeflow.local', 'CASHIER', 'BRANCH_ONLY', 'cmnxg6rmd000geym4uekfvz1b', '{}', '{}', 'ACCEPTED', 'cmnocmubb0000eyh4r1qtqnxr', '2026-04-20 17:12:41.969', '2026-04-13 17:14:24.888', '2026-04-13 17:12:41.993', '2026-04-13 17:14:25.572', 'DEFAULT', NULL, NULL, 'c7e95090db97b9c57fbcc4c21f7c333359a01175ee53c746750f76a333f21b4e', 'invite-cashier-67dc66', NULL, NULL);
INSERT INTO public."StaffInvite" (id, "businessId", email, role, scope, "branchId", "grantedPermissions", "revokedPermissions", status, "invitedByUserId", "expiresAt", "acceptedAt", "createdAt", "updatedAt", "templateKey", note, "cancelledAt", "tokenHash", "publicInviteLabel", "contactEmail", "contactPhone") VALUES ('cmnxgyp0e0013eym4h80lcr4p', 'cmnvn3gi30001eywonooiglki', 'mohamed.benghzi.stock@omarcafe.cafeflow.local', 'INVENTORY_MANAGER', 'BRANCH_ONLY', 'cmnxg6rmd000geym4uekfvz1b', '{}', '{}', 'ACCEPTED', 'cmnocmubb0000eyh4r1qtqnxr', '2026-04-20 17:31:20.198', '2026-04-13 17:32:52.484', '2026-04-13 17:31:20.222', '2026-04-13 17:32:53.098', 'DEFAULT', NULL, NULL, 'b7a192c9c596aae9ffaaddc5f339c542ad68b4e5bbb5b7433821a8d8443e52eb', 'invite-stock-184fcd', NULL, NULL);
INSERT INTO public."StaffInvite" (id, "businessId", email, role, scope, "branchId", "grantedPermissions", "revokedPermissions", status, "invitedByUserId", "expiresAt", "acceptedAt", "createdAt", "updatedAt", "templateKey", note, "cancelledAt", "tokenHash", "publicInviteLabel", "contactEmail", "contactPhone") VALUES ('cmnxr6iff000eeyr0c62ocyfe', 'cmnvn3gi30001eywonooiglki', 'hamade.alramle.accounting@omarcafe.cafeflow.local', 'ACCOUNTANT', 'ALL_BRANCHES', NULL, '{}', '{}', 'ACCEPTED', 'cmnocmubb0000eyh4r1qtqnxr', '2026-04-20 22:17:21.074', '2026-04-13 22:33:22.222', '2026-04-13 22:17:21.1', '2026-04-13 22:33:22.571', 'DEFAULT', NULL, NULL, 'f4ad5596caf20adedc33b81ec475fd44afbb3d062c470ea7d85720999cedbd08', 'invite-accounting-eae23a', NULL, NULL);


--
-- Data for Name: StockMovement; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmno9cdp30007ey8wrnudlg0w', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'STOCK_IN', 10.0000, 55.0000, NULL, '2026-04-07 06:48:06.232');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnoaay630001ey1o8h7twblr', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'استهلاك منتج: إسبريسو', '2026-04-07 07:14:59.067');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnoab6k80003ey1odvjbr9yk', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'استهلاك منتج: إسبريسو', '2026-04-07 07:15:09.945');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnoattfd0003eyd4pewrwuju', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'استهلاك منتج: إسبريسو', '2026-04-07 07:29:39.385');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnoav73p0007eyd4iqc2ndbn', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0360, NULL, 'إكمال طلب cmnoat6t00001eyd42j2jiehf | استهلاك منتج: إسبريسو', '2026-04-07 07:30:43.765');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnob5ugv000heyd4xsc5yryx', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'إكمال طلب cmnob48c00009eyd461uhjx5c | استهلاك منتج: إسبريسو', '2026-04-07 07:39:00.607');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnob5uhb000jeyd4pdh17f3c', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'إكمال طلب cmnob48c00009eyd461uhjx5c | استهلاك منتج: إسبريسو', '2026-04-07 07:39:00.624');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnob5uhq000leyd46se4vxay', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.1080, NULL, 'إكمال طلب cmnob48c00009eyd461uhjx5c | استهلاك منتج: إسبريسو', '2026-04-07 07:39:00.639');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnonqi090009eygcasd5hgte', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0900, NULL, 'إكمال طلب cmnonq66d0005eygcxtmu6pa5 | استهلاك منتج: إسبريسو', '2026-04-07 13:30:59.626');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnoo2wh0000feygc725ntcsz', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.1260, NULL, 'إكمال طلب cmnoo2d73000beygc9wkxcuqp | استهلاك منتج: إسبريسو', '2026-04-07 13:40:38.244');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnou034y000neygcj0i9itp7', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnou033z000jeygcpnsriwlo | استهلاك منتج: إسبريسو', '2026-04-07 16:26:24.61');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnou0smj000teygcuwo91l0n', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0360, NULL, 'POS order cmnou0slw000peygco0w8ijje | استهلاك منتج: إسبريسو', '2026-04-07 16:26:57.643');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnou1mr8000zeygcnkoauhk7', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.4680, NULL, 'POS order cmnou1mpy000veygcxpzy31f6 | استهلاك منتج: إسبريسو', '2026-04-07 16:27:36.693');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnowx8mu001deygcvskgk0uy', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'OPENING_BALANCE', 10.0000, 5.0000, NULL, '2026-04-07 17:48:10.614');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnox34qb001neygcdhptqem7', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnox34pu001heygcj3sizbsn | استهلاك منتج: إسبريسو', '2026-04-07 17:52:45.491');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnox34qn001peygch1k61up9', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnox34pu001heygcj3sizbsn | استهلاك منتج: كابتشينو', '2026-04-07 17:52:45.503');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnox34qu001reygcpauna9z1', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.4800, NULL, 'POS order cmnox34pu001heygcj3sizbsn | استهلاك منتج: كابتشينو', '2026-04-07 17:52:45.51');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnox4b2f001teygchd36ieu1', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'OPENING_BALANCE', 50.0000, 5.0000, NULL, '2026-04-07 17:53:40.359');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnox4ryq0021eygc5gpto6t5', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.2160, NULL, 'POS order cmnox4ry8001veygcct4o749c | استهلاك منتج: كابتشينو', '2026-04-07 17:54:02.258');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnox4ryz0023eygcehut0b47', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 1.4400, NULL, 'POS order cmnox4ry8001veygcct4o749c | استهلاك منتج: كابتشينو', '2026-04-07 17:54:02.267');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnox4rzc0025eygc74msxrca', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.1260, NULL, 'POS order cmnox4ry8001veygcct4o749c | استهلاك منتج: إسبريسو', '2026-04-07 17:54:02.281');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpxhmfq002deygc08vrrvnc', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnpxhmex0027eygcltt60n4a | استهلاك منتج: إسبريسو', '2026-04-08 10:51:47.799');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpxhmg4002feygcjvemnn4e', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.1080, NULL, 'POS order cmnpxhmex0027eygcltt60n4a | استهلاك منتج: كابتشينو', '2026-04-08 10:51:47.812');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpxhmg9002heygc28zntx3k', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.7200, NULL, 'POS order cmnpxhmex0027eygcltt60n4a | استهلاك منتج: كابتشينو', '2026-04-08 10:51:47.818');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5hkr0007ey8o8f9n2632', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnpy5hk70001ey8ook4sa6ac | استهلاك منتج: إسبريسو', '2026-04-08 11:10:21.244');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5hl50009ey8on18q43zl', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnpy5hk70001ey8ook4sa6ac | استهلاك منتج: كابتشينو', '2026-04-08 11:10:21.257');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5hlb000bey8opeb8tyh4', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.4800, NULL, 'POS order cmnpy5hk70001ey8ook4sa6ac | استهلاك منتج: كابتشينو', '2026-04-08 11:10:21.263');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5mdi000jey8og57ofs3r', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnpy5md5000dey8o0xg9yge8 | استهلاك منتج: إسبريسو', '2026-04-08 11:10:27.463');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5mdu000ley8ouhpyea5z', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnpy5md5000dey8o0xg9yge8 | استهلاك منتج: كابتشينو', '2026-04-08 11:10:27.475');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5me1000ney8oy902llxt', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.4800, NULL, 'POS order cmnpy5md5000dey8o0xg9yge8 | استهلاك منتج: كابتشينو', '2026-04-08 11:10:27.482');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5o85000vey8oce514rrc', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnpy5o7s000pey8oshlocxrz | استهلاك منتج: إسبريسو', '2026-04-08 11:10:29.861');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5o8g000xey8o7j1un94p', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnpy5o7s000pey8oshlocxrz | استهلاك منتج: كابتشينو', '2026-04-08 11:10:29.872');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnpy5o8l000zey8olmei1j36', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.4800, NULL, 'POS order cmnpy5o7s000pey8oshlocxrz | استهلاك منتج: كابتشينو', '2026-04-08 11:10:29.878');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq0r0ym0007eym8t4hakhut', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.1080, NULL, 'POS order cmnq0r0xo0001eym8jhsuteux | استهلاك منتج: إسبريسو', '2026-04-08 12:23:05.374');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq0r0z10009eym8lhvtiz85', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnq0r0xo0001eym8jhsuteux | استهلاك منتج: كابتشينو', '2026-04-08 12:23:05.39');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq0r0z7000beym8vhffhsh6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.4800, NULL, 'POS order cmnq0r0xo0001eym8jhsuteux | استهلاك منتج: كابتشينو', '2026-04-08 12:23:05.396');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq0y1rl000jeym84g8nwmoa', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.3960, NULL, 'POS order cmnq0y1r0000deym8axs8r1mh | استهلاك منتج: إسبريسو', '2026-04-08 12:28:33.01');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq0y1s0000leym81yvqyw2t', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.2340, NULL, 'POS order cmnq0y1r0000deym8axs8r1mh | استهلاك منتج: كابتشينو', '2026-04-08 12:28:33.025');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq0y1s9000neym8jjwci68d', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 1.5600, NULL, 'POS order cmnq0y1r0000deym8axs8r1mh | استهلاك منتج: كابتشينو', '2026-04-08 12:28:33.033');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq1slwu000veym8kfq117di', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq1slwa000peym8odqkxfpq | استهلاك منتج: إسبريسو', '2026-04-08 12:52:18.798');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq1slx8000xeym8oxcoyfq0', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq1slwa000peym8odqkxfpq | استهلاك منتج: كابتشينو', '2026-04-08 12:52:18.813');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq1slxi000zeym8koe2djtg', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnq1slwa000peym8odqkxfpq | استهلاك منتج: كابتشينو', '2026-04-08 12:52:18.823');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2pdi60017eym8wc9q5nmr', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0360, NULL, 'POS order cmnq2pdh90011eym8mqy5sx35 | استهلاك منتج: إسبريسو', '2026-04-08 13:17:47.55');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2pdiw0019eym8ikhv97ol', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnq2pdh90011eym8mqy5sx35 | استهلاك منتج: كابتشينو', '2026-04-08 13:17:47.576');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2pdj4001beym8gwyxr6ob', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnq2pdh90011eym8mqy5sx35 | استهلاك منتج: كابتشينو', '2026-04-08 13:17:47.584');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2y1gb0007eyhgvqk0y6d7', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnq2y1f70001eyhgg3p8ra84 | استهلاك منتج: إسبريسو', '2026-04-08 13:24:31.836');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2y1gu0009eyhgyi5ce7qv', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.4500, NULL, 'POS order cmnq2y1f70001eyhgg3p8ra84 | استهلاك منتج: كابتشينو', '2026-04-08 13:24:31.854');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2y1h1000beyhgpx2nm4a5', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 3.0000, NULL, 'POS order cmnq2y1f70001eyhgg3p8ra84 | استهلاك منتج: كابتشينو', '2026-04-08 13:24:31.862');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2zjwd000jeyhggzd7syfk', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq2zjw0000deyhgebghq8x7 | استهلاك منتج: كابتشينو', '2026-04-08 13:25:42.397');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2zjwi000leyhgdd2soh5l', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnq2zjw0000deyhgebghq8x7 | استهلاك منتج: كابتشينو', '2026-04-08 13:25:42.403');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq2zjwv000neyhgr7c8ef4k', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq2zjw0000deyhgebghq8x7 | استهلاك منتج: إسبريسو', '2026-04-08 13:25:42.415');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq3aj6v000teyhg5bcno7nl', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq3aj5x000peyhggh3zuv03 | استهلاك منتج: إسبريسو', '2026-04-08 13:34:14.696');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq5vw8u0007eyy46176hj15', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq5vw7x0001eyy425suqpp9 | استهلاك منتج: كابتشينو', '2026-04-08 14:46:50.622');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq5vw900009eyy4veo4jhbz', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnq5vw7x0001eyy425suqpp9 | استهلاك منتج: كابتشينو', '2026-04-08 14:46:50.629');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq5vw9c000beyy4h3xyg1w3', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq5vw7x0001eyy425suqpp9 | استهلاك منتج: إسبريسو', '2026-04-08 14:46:50.641');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq5ykn6000heyy42fvhw6z0', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq5ykmd000deyy42jn7vnqi | استهلاك منتج: إسبريسو', '2026-04-08 14:48:55.554');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq5yuqa000peyy43h3otq0p', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq5yupv000jeyy4tgn5lft5 | استهلاك منتج: إسبريسو', '2026-04-08 14:49:08.626');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq5yuqm000reyy4d5jga6ra', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq5yupv000jeyy4tgn5lft5 | استهلاك منتج: كابتشينو', '2026-04-08 14:49:08.639');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq5yuqs000teyy4nshi7co6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnq5yupv000jeyy4tgn5lft5 | استهلاك منتج: كابتشينو', '2026-04-08 14:49:08.644');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq78xc90011eyy49i9swqd2', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq78xbf000veyy4xzi84vtn | استهلاك منتج: إسبريسو', '2026-04-08 15:24:58.186');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq78xcq0013eyy4g83t5uit', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq78xbf000veyy4xzi84vtn | استهلاك منتج: كابتشينو', '2026-04-08 15:24:58.203');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq78xcw0015eyy4vubjlw74', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnq78xbf000veyy4xzi84vtn | استهلاك منتج: كابتشينو', '2026-04-08 15:24:58.209');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq79ir6001deyy4hd1zgpjt', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq79iqh0017eyy451ibbv49 | استهلاك منتج: إسبريسو', '2026-04-08 15:25:25.938');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq79irk001feyy42tg38vx1', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq79iqh0017eyy451ibbv49 | استهلاك منتج: كابتشينو', '2026-04-08 15:25:25.952');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq79irp001heyy4p1bil5iy', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnq79iqh0017eyy451ibbv49 | استهلاك منتج: كابتشينو', '2026-04-08 15:25:25.958');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq79xbe001peyy45gkt0wd5', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq79xaq001jeyy4nbyl4xoh | استهلاك منتج: إسبريسو', '2026-04-08 15:25:44.81');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq79xbr001reyy4iqpngv2y', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.2520, NULL, 'POS order cmnq79xaq001jeyy4nbyl4xoh | استهلاك منتج: كابتشينو', '2026-04-08 15:25:44.823');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq79xby001teyy4evboid92', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 1.6800, NULL, 'POS order cmnq79xaq001jeyy4nbyl4xoh | استهلاك منتج: كابتشينو', '2026-04-08 15:25:44.83');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq8t6v60021eyy4cxmj92y3', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq8t6u9001veyy4csv8xcbl | استهلاك منتج: إسبريسو', '2026-04-08 16:08:43.267');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq8t6vo0023eyy4nyywnife', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnq8t6u9001veyy4csv8xcbl | استهلاك منتج: كابتشينو', '2026-04-08 16:08:43.284');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnq8t6vv0025eyy4rb9oiahz', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnq8t6u9001veyy4csv8xcbl | استهلاك منتج: كابتشينو', '2026-04-08 16:08:43.291');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqavcr4002deyy4l7747vnn', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.9000, NULL, 'POS order cmnqavcpt0027eyy4epyibx7f | استهلاك منتج: كابتشينو', '2026-04-08 17:06:23.44');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqavcta002feyy4pl4tkmn2', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 6.0000, NULL, 'POS order cmnqavcpt0027eyy4epyibx7f | استهلاك منتج: كابتشينو', '2026-04-08 17:06:23.518');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqavcts002heyy4zt9x7bgd', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnqavcpt0027eyy4epyibx7f | استهلاك منتج: إسبريسو', '2026-04-08 17:06:23.537');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqax5u8002jeyy4ey3kygpd', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'STOCK_IN', 5.0000, 58.0000, NULL, '2026-04-08 17:07:47.793');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqayrij002peyy48f9ar1po', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqayrhv002leyy472a51obo | استهلاك منتج: إسبريسو', '2026-04-08 17:09:02.539');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqb7m3c002xeyy4cet1qrwm', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqb7m2k002reyy408o6lnis | استهلاك منتج: كابتشينو', '2026-04-08 17:15:55.416');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqb7m3m002zeyy4dw2usp6m', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnqb7m2k002reyy408o6lnis | استهلاك منتج: كابتشينو', '2026-04-08 17:15:55.427');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqb7m470031eyy4d8j25wwf', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqb7m2k002reyy408o6lnis | استهلاك منتج: إسبريسو', '2026-04-08 17:15:55.447');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqc55rg0004eyq04n2edfse', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'إكمال طلب cmnosrdg2000heygctsphg0ew | استهلاك منتج: إسبريسو', '2026-04-08 17:42:00.556');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqk4lmi0005eyo0y55vtymt', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'إكمال طلب cmnqk3gvg0001eyo00spav5ix | استهلاك منتج: إسبريسو', '2026-04-08 21:25:31.386');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqlhpv10007eyo0koiav218', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.1620, NULL, 'إكمال طلب cmnob60bs000neyd4783sohxj | استهلاك منتج: إسبريسو', '2026-04-08 22:03:43.022');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqlhpvi0009eyo07g6rzrd6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0360, NULL, 'إكمال طلب cmnob60bs000neyd4783sohxj | استهلاك منتج: إسبريسو', '2026-04-08 22:03:43.038');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqmaws50007eyngns41ujl9', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnqmawqv0001eyng2wv55x4l | استهلاك منتج: كابتشينو', '2026-04-08 22:26:25.014');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqmawsj0009eyngav4int0u', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.4800, NULL, 'POS order cmnqmawqv0001eyng2wv55x4l | استهلاك منتج: كابتشينو', '2026-04-08 22:26:25.027');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqmawt1000beyngum49ecp3', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqmawqv0001eyng2wv55x4l | استهلاك منتج: إسبريسو', '2026-04-08 22:26:25.045');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnb75m000jeyngp599kfmz', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqnb747000deyngf8qnfz4k | استهلاك منتج: كابتشينو', '2026-04-08 22:54:38.074');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnb75z000leyngvjax2u0g', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnqnb747000deyngf8qnfz4k | استهلاك منتج: كابتشينو', '2026-04-08 22:54:38.087');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnb76h000neyng8e3gj7jt', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqnb747000deyngf8qnfz4k | استهلاك منتج: إسبريسو', '2026-04-08 22:54:38.106');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnyb62000veyng0pslhsos', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqnyb4r000peynga0m2jaid | استهلاك منتج: إسبريسو', '2026-04-08 23:12:36.363');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnyb7r000xeyngrnhmjsgs', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqnyb4r000peynga0m2jaid | استهلاك منتج: كابتشينو', '2026-04-08 23:12:36.424');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnyb80000zeyngngb06raj', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnqnyb4r000peynga0m2jaid | استهلاك منتج: كابتشينو', '2026-04-08 23:12:36.433');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnywg60015eyngv5789zyb', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.1260, NULL, 'POS order cmnqnywfg0011eyngqz18gqdp | استهلاك منتج: إسبريسو', '2026-04-08 23:13:03.942');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnzcg6001deyng1ym3s2nw', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.1260, NULL, 'POS order cmnqnzcfj0017eyngt5mxnhkb | استهلاك منتج: إسبريسو', '2026-04-08 23:13:24.678');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnzch9001feyngc945s4ai', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqnzcfj0017eyngt5mxnhkb | استهلاك منتج: كابتشينو', '2026-04-08 23:13:24.718');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqnzchj001heyngzqrlwubl', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnqnzcfj0017eyngt5mxnhkb | استهلاك منتج: كابتشينو', '2026-04-08 23:13:24.727');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqoanom001neyngaoabidw5', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqoanna001jeynga9pzs599 | استهلاك منتج: كابتشينو', '2026-04-08 23:22:12.454');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqoanox001peyng30eqdle0', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnqoanna001jeynga9pzs599 | استهلاك منتج: كابتشينو', '2026-04-08 23:22:12.465');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqob348001xeynglexfeg0b', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqob33p001reyngqj7x5xjo | استهلاك منتج: كابتشينو', '2026-04-08 23:22:32.457');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqob34i001zeyng62vxp0y8', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnqob33p001reyngqj7x5xjo | استهلاك منتج: كابتشينو', '2026-04-08 23:22:32.466');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqob34y0021eyngj8pei1ix', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqob33p001reyngqj7x5xjo | استهلاك منتج: إسبريسو', '2026-04-08 23:22:32.483');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqorccw0029eyngkbson1cn', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0900, NULL, 'POS order cmnqorcb80023eynge7s5m5ji | استهلاك منتج: إسبريسو', '2026-04-08 23:35:10.928');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqorcdg002beyng9r4i6bnn', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnqorcb80023eynge7s5m5ji | استهلاك منتج: كابتشينو', '2026-04-08 23:35:10.948');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqorcdp002deyngfbb5efz6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnqorcb80023eynge7s5m5ji | استهلاك منتج: كابتشينو', '2026-04-08 23:35:10.957');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotjqg002leyngh7t84vse', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0900, NULL, 'POS order cmnqotjpv002feynglo1lwlzy | استهلاك منتج: إسبريسو', '2026-04-08 23:36:53.801');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotjqy002neynglpm5dtl1', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnqotjpv002feynglo1lwlzy | استهلاك منتج: كابتشينو', '2026-04-08 23:36:53.818');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotjr8002peyng7gxt319r', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnqotjpv002feynglo1lwlzy | استهلاك منتج: كابتشينو', '2026-04-08 23:36:53.829');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotng7002xeyngt5zjw6nz', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0900, NULL, 'POS order cmnqotnfm002reynga4qa11xm | استهلاك منتج: إسبريسو', '2026-04-08 23:36:58.615');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotngn002zeyngxo6nnjp6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnqotnfm002reynga4qa11xm | استهلاك منتج: كابتشينو', '2026-04-08 23:36:58.632');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotngw0031eyngu62s216m', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnqotnfm002reynga4qa11xm | استهلاك منتج: كابتشينو', '2026-04-08 23:36:58.641');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotohl0039eyngrbq9xbu2', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0900, NULL, 'POS order cmnqotoh20033eyngxivv1xk5 | استهلاك منتج: إسبريسو', '2026-04-08 23:36:59.961');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotoi1003beyngrdyitus6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnqotoh20033eyngxivv1xk5 | استهلاك منتج: كابتشينو', '2026-04-08 23:36:59.978');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotoia003deyng9cut63j1', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnqotoh20033eyngxivv1xk5 | استهلاك منتج: كابتشينو', '2026-04-08 23:36:59.987');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotpvd003leyngcvawvw2b', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0900, NULL, 'POS order cmnqotpun003feyngb54vhj7g | استهلاك منتج: إسبريسو', '2026-04-08 23:37:01.754');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotpw5003neyng5tonl2zc', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnqotpun003feyngb54vhj7g | استهلاك منتج: كابتشينو', '2026-04-08 23:37:01.781');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqotpwf003peyngr44cyozr', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnqotpun003feyngb54vhj7g | استهلاك منتج: كابتشينو', '2026-04-08 23:37:01.791');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpb6vo003xeyng04qdauav', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnqpb6t3003reyngk3tk9vew | استهلاك منتج: إسبريسو', '2026-04-08 23:50:36.948');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpb6wy003zeynglathsv71', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnqpb6t3003reyngk3tk9vew | استهلاك منتج: كابتشينو', '2026-04-08 23:50:36.995');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpb6ya0041eyngqp8nfsu8', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnqpb6t3003reyngk3tk9vew | استهلاك منتج: كابتشينو', '2026-04-08 23:50:37.042');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpcf0m0047eyng8aatm1tv', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.2700, NULL, 'POS order cmnqpcezi0043eyng2hxr3lg5 | استهلاك منتج: كابتشينو', '2026-04-08 23:51:34.15');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpcf0x0049eyngch76fh6e', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 1.8000, NULL, 'POS order cmnqpcezi0043eyng2hxr3lg5 | استهلاك منتج: كابتشينو', '2026-04-08 23:51:34.161');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpdzhf004feyngp4egep3x', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqpdzgf004beyngtfjm1mir | استهلاك منتج: كابتشينو', '2026-04-08 23:52:47.331');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpdzhq004heyngcjpuc2f2', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnqpdzgf004beyngtfjm1mir | استهلاك منتج: كابتشينو', '2026-04-08 23:52:47.342');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpelcz004neyngr7xfdq57', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0360, NULL, 'POS order cmnqpelc7004jeyngsesms3z7 | استهلاك منتج: إسبريسو', '2026-04-08 23:53:15.683');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpfyre004teyngfqhw0pfx', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.3960, NULL, 'POS order cmnqpfyqk004peyngkvhepep3 | استهلاك منتج: كابتشينو', '2026-04-08 23:54:19.707');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpfyrn004veyng3aunlfym', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 2.6400, NULL, 'POS order cmnqpfyqk004peyngkvhepep3 | استهلاك منتج: كابتشينو', '2026-04-08 23:54:19.716');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpiqtu0053eyngwiu7ffgy', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0360, NULL, 'POS order cmnqpiqsg004xeyngrjc95wcy | استهلاك منتج: كابتشينو', '2026-04-08 23:56:29.394');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpiqv50055eyng59x9xskp', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.2400, NULL, 'POS order cmnqpiqsg004xeyngrjc95wcy | استهلاك منتج: كابتشينو', '2026-04-08 23:56:29.441');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpiqvq0057eyngz0p3d71c', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnqpiqsg004xeyngrjc95wcy | استهلاك منتج: إسبريسو', '2026-04-08 23:56:29.463');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqpiu71005deyngwvieuj4o', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0720, NULL, 'POS order cmnqpiu6h0059eyngqexo2rkf | استهلاك منتج: إسبريسو', '2026-04-08 23:56:33.758');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqqc9d4005leyngcdy8lf1q', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'POS order cmnqqc9ce005feynggplxafww | استهلاك منتج: كابتشينو', '2026-04-09 00:19:26.441');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqqc9dc005neyngzilkxc2m', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.3600, NULL, 'POS order cmnqqc9ce005feynggplxafww | استهلاك منتج: كابتشينو', '2026-04-09 00:19:26.448');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnqqc9do005peyngq6b29x6e', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0900, NULL, 'POS order cmnqqc9ce005feynggplxafww | استهلاك منتج: إسبريسو', '2026-04-09 00:19:26.46');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr682ex006beyngivoy25xk', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnr682e40063eyng1rfw17g8 | استهلاك منتج: لاتيه', '2026-04-09 07:44:04.665');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr682f6006deyngy14yn3qc', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1500, NULL, 'POS order cmnr682e40063eyng1rfw17g8 | استهلاك منتج: لاتيه', '2026-04-09 07:44:04.675');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr682fj006feyng41454ce6', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnr682e40063eyng1rfw17g8 | استهلاك منتج: كابتشينو', '2026-04-09 07:44:04.687');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr682fp006heyngurpmgsq7', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnr682e40063eyng1rfw17g8 | استهلاك منتج: كابتشينو', '2026-04-09 07:44:04.693');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr682g2006jeyngopol89ff', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnr682e40063eyng1rfw17g8 | استهلاك منتج: إسبريسو', '2026-04-09 07:44:04.706');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr68qga006teyngbrth5mi1', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnr68qfu006leyng3zgkfkkt | استهلاك منتج: لاتيه', '2026-04-09 07:44:35.818');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr68qgf006veynghaw1bsxy', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1500, NULL, 'POS order cmnr68qfu006leyng3zgkfkkt | استهلاك منتج: لاتيه', '2026-04-09 07:44:35.824');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr68qgr006xeyngyyrsmbiq', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnr68qfu006leyng3zgkfkkt | استهلاك منتج: كابتشينو', '2026-04-09 07:44:35.835');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr68qgx006zeyng2ovz9glh', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'POS order cmnr68qfu006leyng3zgkfkkt | استهلاك منتج: كابتشينو', '2026-04-09 07:44:35.841');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr68qh80071eynggrhnnyz8', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'POS order cmnr68qfu006leyng3zgkfkkt | استهلاك منتج: إسبريسو', '2026-04-09 07:44:35.853');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnr7q6u70073eyngwzx22vgj', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'ADJUSTMENT_SUBTRACT', 0.0010, NULL, 'سبب التسوية: تصحيح إدخال سابق', '2026-04-09 08:26:09.822');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbkjlg0001eymwhdp5knnz', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0900, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: لاتيه | المادة: بن الإسبريسو | قبل: 6.917 | بعد: 6.827 | المنفذ: CafeFlow Owner', '2026-04-09 10:13:44.884');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbkjlv0003eymwmrnrjdo2', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.7500, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: لاتيه | المادة: حليب | قبل: 32.94 | بعد: 32.19 | المنفذ: CafeFlow Owner', '2026-04-09 10:13:44.899');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbt8yk000deymwvgfuys83', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: إسبريسو | المادة: بن الإسبريسو | قبل: 6.827 | بعد: 6.809 | ملاحظة: POS order cmnrbt8wc0005eymw3ga78qpx', '2026-04-09 10:20:31.004');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbt8za000feymwpvd1ualk', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: كابتشينو | المادة: بن الإسبريسو | قبل: 6.809 | بعد: 6.791 | ملاحظة: POS order cmnrbt8wc0005eymw3ga78qpx', '2026-04-09 10:20:31.031');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbt8zj000heymw3tm1vvvr', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1200, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: كابتشينو | المادة: حليب | قبل: 32.19 | بعد: 32.07 | ملاحظة: POS order cmnrbt8wc0005eymw3ga78qpx', '2026-04-09 10:20:31.039');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbt905000jeymwtwru97f1', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0180, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: لاتيه | المادة: بن الإسبريسو | قبل: 6.791 | بعد: 6.773 | ملاحظة: POS order cmnrbt8wc0005eymw3ga78qpx', '2026-04-09 10:20:31.061');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbt90f000leymwoak7avyo', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.1500, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: لاتيه | المادة: حليب | قبل: 32.07 | بعد: 31.92 | ملاحظة: POS order cmnrbt8wc0005eymw3ga78qpx', '2026-04-09 10:20:31.072');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbzq27000neymwqdrmnam5', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.0540, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: لاتيه | المادة: بن الإسبريسو | قبل: 6.773 | بعد: 6.719 | المنفذ: CafeFlow Owner', '2026-04-09 10:25:33.104');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrbzq2i000peymwz6hya10d', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 0.4500, NULL, 'استهلاك يدوي عبر شاشة الاستهلاك | منتج: لاتيه | المادة: حليب | قبل: 31.92 | بعد: 31.47 | المنفذ: CafeFlow Owner', '2026-04-09 10:25:33.114');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrce5k6000veymw2ore0ge2', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'CONSUMPTION', 0.3600, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnrce5j0000reymw38fkmhp5
المنتج: لاتيه
المادة: بن الإسبريسو
الكمية: 0.36 kg
الرصيد قبل: 6.719
الرصيد بعد: 6.359
المنفذ: CafeFlow Owner (كاشير POS)
المصدر: POS Order', '2026-04-09 10:36:46.374');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrce5ld000xeymwaoc05tpb', 'cmnnnw8ab0001eyrkejds4lph', 'cmnowvhlb0019eygcnagu326r', 'CONSUMPTION', 3.0000, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnrce5j0000reymw38fkmhp5
المنتج: لاتيه
المادة: حليب
الكمية: 3 مل
الرصيد قبل: 31.47
الرصيد بعد: 28.47
المنفذ: CafeFlow Owner (كاشير POS)
المصدر: POS Order', '2026-04-09 10:36:46.417');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnrchzvv000zeymwg6mfeoap', 'cmnnnw8ab0001eyrkejds4lph', 'cmnnq13u00007ey74q96xba8j', 'STOCK_IN', 1.0000, 52.0000, NULL, '2026-04-09 10:39:45.644');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnvnh64h000neywosqvmg8lk', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'ADJUSTMENT_ADD', 6.0000, NULL, 'سبب التسوية: جرد فعلي', '2026-04-12 10:58:07.553');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnvnhczu000teywoskwu4q6d', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0900, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnvnhcyv000peywofsosifal
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.09 كيلو
الرصيد قبل: 6
الرصيد بعد: 5.91
المنفذ: CafeFlow Owner (كاشير POS)
المصدر: POS Order', '2026-04-12 10:58:16.458');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxbcxxd0006eym4wwf40a3p', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnxbcxtr0002eym45zuiedey
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.018 كيلو
الرصيد قبل: 5.91
الرصيد بعد: 5.892
المنفذ: رجب محمود (كاشير POS)
المصدر: POS Order', '2026-04-13 14:54:27.265');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxdzkkk000ceym43j38tj8x', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.9360, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnxdzkjq0008eym4bh8jfd11
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.936 كيلو
الرصيد قبل: 5.892
الرصيد بعد: 4.956
المنفذ: رجب محمود (كاشير POS)
المصدر: POS Order', '2026-04-13 16:08:02.276');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxe1etf000eeym42njkqsmt', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'STOCK_IN', 2.0000, 45.0000, NULL, '2026-04-13 16:09:28.132');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxge63t000veym4mj2aef7l', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0900, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnxge61q000reym4kgnwm85j
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.09 كيلو
الرصيد قبل: 6.956
الرصيد بعد: 6.866
المنفذ: صالح البرعصي (كاشير POS)
المصدر: POS Order', '2026-04-13 17:15:22.601');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxgvsve0011eym4lgx6v2nm', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnxgvsts000xeym4psnazub4
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.018 كيلو
الرصيد قبل: 6.866
الرصيد بعد: 6.848
المنفذ: حسين بن غزي (كاشير POS)
المصدر: POS Order', '2026-04-13 17:29:05.258');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxhgpbk001geym4fwu1j2o6', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnxhgp9r001ceym441gvd7n6
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.018 كيلو
الرصيد قبل: 6.848
الرصيد بعد: 6.83
المنفذ: حسين بن غزي (كاشير POS)
المصدر: POS Order', '2026-04-13 17:45:20.432');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxhh1zw001meym4kxe8irth', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0360, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnxhh1yu001ieym4tonzsb7x
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.036 كيلو
الرصيد قبل: 6.83
الرصيد بعد: 6.794
المنفذ: حسين بن غزي (كاشير POS)
المصدر: POS Order', '2026-04-13 17:45:36.86');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxpt0v80005eyr03fa2qzt5', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnxpt0u40001eyr0lia5l00s
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.018 كيلو
الرصيد قبل: 6.794
الرصيد بعد: 6.776
المنفذ: رجب محمود (كاشير POS)
المصدر: POS Order', '2026-04-13 21:38:52.197');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnxptuzr000beyr0geye20g7', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnxptuyy0007eyr0ppvdz5wv
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.018 كيلو
الرصيد قبل: 6.776
الرصيد بعد: 6.758
المنفذ: رجب محمود (كاشير POS)
المصدر: POS Order', '2026-04-13 21:39:31.24');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmnyqmw540005eyxk4vj4qnd4', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'المرجع: استهلاك عبر POS | طلب: #cmnyqmw2s0001eyxkldvofyaj
المنتج: إسبريسو
المادة: بن الإسبريسو
الكمية: 0.018 كيلو
الرصيد قبل: 6.758
الرصيد بعد: 6.74
المنفذ: CafeFlow Owner (كاشير POS)
المصدر: POS Order', '2026-04-14 14:49:51.928');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo1ta6830005eyuszo3809n0', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0360, NULL, 'Reference: Manual consumption | Product: إسبريسو
Product: إسبريسو
Material: بن الإسبريسو
Quantity: 0.036 كيلو
Balance before: 6.74
Balance after: 6.704
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-16 18:27:15.844');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo1tazuc000beyustev2g312', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: إسبريسو
Product: إسبريسو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.704
Balance after: 6.686
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-16 18:27:54.228');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo4a6r7e0013eyusc5o2qe06', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'STOCK_IN', 10.0000, 5.5000, NULL, '2026-04-18 11:56:02.233');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo4a8h1h0015eyusma515br9', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'OPENING_BALANCE', 5.0000, 5.0000, NULL, '2026-04-18 11:57:22.374');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo4a901s001feyus4iefgwg0', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.686
Balance after: 6.668
Executed by: صالح البرعصي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-18 11:57:47.009');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo4a9023001heyusiu58zu4r', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1200, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.12 مل
Balance before: 15
Balance after: 14.88
Executed by: صالح البرعصي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-18 11:57:47.02');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo4a902o001jeyusehib4b73', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: إسبريسو
Product: إسبريسو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.668
Balance after: 6.65
Executed by: صالح البرعصي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-18 11:57:47.041');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo4a903g001leyuspx2b7b12', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.65
Balance after: 6.632
Executed by: صالح البرعصي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-18 11:57:47.068');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo4a903s001neyus8uoa2d47', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1500, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: حليب
Quantity: 0.15 مل
Balance before: 14.88
Balance after: 14.73
Executed by: صالح البرعصي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-18 11:57:47.08');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo50omi60009eyqoj6gj3qv3', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.632
Balance after: 6.614
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 00:17:45.967');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo50omil000beyqog0g5yp7m', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1200, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.12 مل
Balance before: 14.73
Balance after: 14.61
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 00:17:45.982');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo50omj0000deyqotxukzzkb', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: إسبريسو
Product: إسبريسو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.614
Balance after: 6.596
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 00:17:45.996');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo50omjd000feyqou8h1wgmo', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.596
Balance after: 6.578
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 00:17:46.01');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo50omjk000heyqox82w5xlq', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1500, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: حليب
Quantity: 0.15 مل
Balance before: 14.61
Balance after: 14.46
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 00:17:46.016');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6br24s0009ey10bh3plxpr', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.578
Balance after: 6.56
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:15:21.484');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6br256000bey10f1wr2wwg', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1200, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.12 مل
Balance before: 14.46
Balance after: 14.34
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:15:21.498');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6br25l000dey10ss4tscun', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: إسبريسو
Product: إسبريسو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.56
Balance after: 6.542
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:15:21.513');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6br25y000fey10oggp2mf4', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.542
Balance after: 6.524
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:15:21.526');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6br266000hey10l6bzagan', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1500, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: حليب
Quantity: 0.15 مل
Balance before: 14.34
Balance after: 14.19
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:15:21.534');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6brm8o000ney10v3wc9u3r', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.1800, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.18 كيلو
Balance before: 6.524
Balance after: 6.344
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:15:47.545');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6brm8v000pey10wej1713u', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 1.2000, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 1.2 مل
Balance before: 14.19
Balance after: 12.99
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:15:47.552');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6cldwc000zey1042vvbs7g', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.344
Balance after: 6.326
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:38:56.413');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6cldwm0011ey109r0gz7kx', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1200, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.12 مل
Balance before: 12.99
Balance after: 12.87
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:38:56.423');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6cldx00013ey105o88j4ki', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: إسبريسو
Product: إسبريسو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.326
Balance after: 6.308
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:38:56.436');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6cldxf0015ey10tgmar5fi', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.308
Balance after: 6.29
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:38:56.451');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6cldxl0017ey10qnut1mdx', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1500, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: حليب
Quantity: 0.15 مل
Balance before: 12.87
Balance after: 12.72
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:38:56.458');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6cneic001dey10k29ehgeg', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.29
Balance after: 6.272
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:40:30.516');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6cneij001fey10vvxx38j0', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1200, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.12 مل
Balance before: 12.72
Balance after: 12.6
Executed by: حسين بن غزي (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 22:40:30.523');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6f816l001pey10zxb3puk4', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0540, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.054 كيلو
Balance before: 6.272
Balance after: 6.218
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:52:32.254');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6f817o001rey10z6udr5l4', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.3600, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.36 مل
Balance before: 12.6
Balance after: 12.24
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:52:32.293');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6f818e001tey10aqw4465f', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 6.218
Balance after: 6.2
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:52:32.318');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6f818o001vey10ya3t8buq', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1500, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: حليب
Quantity: 0.15 مل
Balance before: 12.24
Balance after: 12.09
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:52:32.328');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6f819e001xey1038tk49tl', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0900, NULL, 'Reference: Manual consumption | Product: إسبريسو
Product: إسبريسو
Material: بن الإسبريسو
Quantity: 0.09 كيلو
Balance before: 6.2
Balance after: 6.11
Executed by: CafeFlow Owner (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:52:32.355');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6fgwsv0027ey10rx9mzona', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0720, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.072 كيلو
Balance before: 6.11
Balance after: 6.038
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:59:26.479');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6fgwta0029ey104ebaclmx', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.4800, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.48 مل
Balance before: 12.09
Balance after: 11.61
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:59:26.494');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6fgwu3002bey10u0m4wqz3', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0540, NULL, 'Reference: Manual consumption | Product: إسبريسو
Product: إسبريسو
Material: بن الإسبريسو
Quantity: 0.054 كيلو
Balance before: 6.038
Balance after: 5.984
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:59:26.523');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6fgwuu002dey10my6rwr3o', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0360, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: بن الإسبريسو
Quantity: 0.036 كيلو
Balance before: 5.984
Balance after: 5.948
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:59:26.55');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6fgwva002fey10v4opoytg', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.3000, NULL, 'Reference: Manual consumption | Product: اَيس لاتيه
Product: اَيس لاتيه
Material: حليب
Quantity: 0.3 مل
Balance before: 11.61
Balance after: 11.31
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-19 23:59:26.566');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6g471c002ley107u3p1yo0', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 5.948
Balance after: 5.93
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-20 00:17:32.832');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6g471n002ney1074elt2dk', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1200, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.12 مل
Balance before: 11.31
Balance after: 11.19
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-20 00:17:32.844');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6g6gei002tey10og6qzhl3', 'cmnvn3gi30001eywonooiglki', 'cmnvnbgim000deywofoj1yaf0', 'CONSUMPTION', 0.0180, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: بن الإسبريسو
Quantity: 0.018 كيلو
Balance before: 5.93
Balance after: 5.912
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-20 00:19:18.283');
INSERT INTO public."StockMovement" (id, "businessId", "rawMaterialId", type, quantity, "unitCost", note, "createdAt") VALUES ('cmo6g6ges002vey10zdjg1oyj', 'cmnvn3gi30001eywonooiglki', 'cmo1trsdw000peyusiyrs8qaz', 'CONSUMPTION', 0.1200, NULL, 'Reference: Manual consumption | Product: كابتشينو
Product: كابتشينو
Material: حليب
Quantity: 0.12 مل
Balance before: 11.19
Balance after: 11.07
Executed by: رجب محمود (نقطة البيع)
Source: طلب نقطة البيع
Note: -', '2026-04-20 00:19:18.292');


--
-- Data for Name: TermsAcceptance; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('c9c6c849-ba65-4223-abfb-70507d9c9705', '1f20385db1d16d99dd6394c4e512ab4d589c9c6bb35d9a949725a0d20928cabd', '2026-04-06 21:14:07.544303+02', '20260406191407_phase2_core_foundation', NULL, NULL, '2026-04-06 21:14:07.432022+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('d0d0810d-5ef6-4ac5-965f-463f705ea3ee', '3b0dbf7ae4aec58e93d53280e0d6eb0b8b26f7328bff8d935a60d741f7e0c6ce', '2026-04-06 22:00:15.862275+02', '20260406200015_phase3_auth_foundation', NULL, NULL, '2026-04-06 22:00:15.838903+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('47056056-64e7-4ca1-94c3-9f586a5cba03', 'a44072ed972ec11cfbadf3deae3e2c8ed73d36dc2f24ee8c2d41c89c68af4581', '2026-04-06 23:25:12.599992+02', '20260406212512_phase5_catalog', NULL, NULL, '2026-04-06 23:25:12.417967+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('ace9c0ef-405f-4f46-a5f1-a5804b106e91', 'ae334cb4cf6c480e8a0ed66f066d5ea5845fcca92c12224cdb3c7e9a965b4925', '2026-04-06 23:56:15.497632+02', '20260406215615_phase6_recipes_inventory', NULL, NULL, '2026-04-06 23:56:15.31401+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('52d38917-eff4-44ab-8e80-fbf296d93289', 'ba4b40b47f600358cf888c66a41889fda01d70975e6f2d2c6713e74a9414fbbd', '2026-04-07 09:07:15.661948+02', '20260407070715_phase7_consumption', NULL, NULL, '2026-04-07 09:07:15.656003+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('2c1188aa-499d-443a-a216-d8e4032b8835', 'd8b6a0c9ee7f2f63e4de66102eb18ade284402beb444f6dd0ced585e7c5001bd', '2026-04-07 09:24:14.091332+02', '20260407072413_phase8_orders_foundation', NULL, NULL, '2026-04-07 09:24:13.91837+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('5657e3f7-7692-4158-aee9-d43fc7b519fa', 'e148ed0fc47d6af4abe99f3ef201a95970bc7e98d218cbab7a0768f164a551c4', '2026-04-07 09:50:54.290613+02', '20260407075054_phase9_reports_foundation', NULL, NULL, '2026-04-07 09:50:54.286135+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('3e12227e-557e-448b-974c-155e26067a7a', 'e894de67623eb6294c196ee7eb69a6b82e496ca8e8238a6950de74ec749c945c', '2026-04-08 13:41:55.162397+02', '20260408114155_add_missing_subscription_columns', NULL, NULL, '2026-04-08 13:41:55.076148+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('270ad74c-0383-4527-a111-cf5a264bcb77', '0ca0b33582da19b928b63c3e9d7b1781c53db12a22bb9430eecf72fdee773399', NULL, '20260408120000_order_status_in_progress', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20260408120000_order_status_in_progress

Database error code: 55P04

Database error:
ERROR: unsafe use of new value "IN_PROGRESS" of enum type "OrderStatus"
HINT: New enum values must be committed before they can be used.

Position:
[1m  1[0m -- Add IN_PROGRESS between conceptual "draft" and "completed" for explainable order management.
[1m  2[0m ALTER TYPE "OrderStatus" ADD VALUE ''IN_PROGRESS'' AFTER ''DRAFT'';
[1m  3[0m
[1m  4[0m -- Existing drafts that already have lines were effectively "being worked"; promote them.
[1m  5[0m UPDATE "Order"
[1m  6[1;31m SET "status" = ''IN_PROGRESS''::"OrderStatus"[0m

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E55P04), message: "unsafe use of new value \"IN_PROGRESS\" of enum type \"OrderStatus\"", detail: None, hint: Some("New enum values must be committed before they can be used."), position: Some(Original(282)), where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("enum.c"), line: Some(102), routine: Some("check_safe_enum_use") }

   0: sql_schema_connector::apply_migration::apply_script
           with migration_name="20260408120000_order_status_in_progress"
             at schema-engine\connectors\sql-schema-connector\src\apply_migration.rs:113
   1: schema_commands::commands::apply_migrations::Applying migration
           with migration_name="20260408120000_order_status_in_progress"
             at schema-engine\commands\src\commands\apply_migrations.rs:95
   2: schema_core::state::ApplyMigrations
             at schema-engine\core\src\state.rs:260', '2026-04-09 00:24:20.966969+02', '2026-04-09 00:23:28.38156+02', 0);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('b9239500-b170-48b4-b4f9-5096f9623dd4', 'd6b5c6ad895e3d3dd07802fbf2f0814397efb289ea1a7a81f93f0de5f7307c48', '2026-04-09 00:24:24.619179+02', '20260408120000_order_status_in_progress', NULL, NULL, '2026-04-09 00:24:24.600473+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('8b64033e-8c56-4527-9ca3-46298083c68c', '3b46891bb041265f33ce9f00f86c6c240f03061bc4b84c0f081a8c9a4c6cd722', '2026-04-09 00:24:24.628891+02', '20260408120001_order_promote_drafts_with_lines', NULL, NULL, '2026-04-09 00:24:24.620107+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('f7a53fef-9297-437b-b53d-5cbdd7bc3fcc', '09308c05629b4a27365d80299f7c71cf0ff8f8ab82b401badb7e15624a53fd47', '2026-04-09 13:37:18.096165+02', '20260409110000_authorization_foundation', NULL, NULL, '2026-04-09 13:37:18.007189+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('117191f3-184d-4aa1-8b49-37c18bd89693', '18c3ccc0269fd54293e58201b120908fef43ed1fb36cf25b9f4a412639639cba', '2026-04-12 16:28:33.994342+02', '20260412140000_staff_invite_foundation', NULL, NULL, '2026-04-12 16:28:33.838097+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('bce4ce11-0ad4-4dec-ae00-ae9a1dd1c6f2', 'd5e6ad243d5f52eb8e6d508abe4719d7d5e936c8c887d7bf9595f5dda4842682', '2026-04-12 23:46:02.363807+02', '20260412180000_staff_invite_token_hash', NULL, NULL, '2026-04-12 23:46:02.277672+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('9abda3fd-2128-40ca-a0ce-15833523e543', '4b89a5dcc421898d7292afbd6e85c8106f8bdcb3e8c495c296c18009fda4b4bf', '2026-04-12 23:46:02.371269+02', '20260413120000_staff_invite_v2_and_roles', NULL, NULL, '2026-04-12 23:46:02.364538+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('7473eea0-53ad-4edf-b1a5-74811e755c2f', '6e229625a853cbd87dc511e91ad68cadda2b4cbfdd81de4de8d551a90516350e', '2026-04-13 20:28:43.740815+02', '20260413180000_remove_membership_role_cleaner', NULL, NULL, '2026-04-13 20:28:43.582263+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('85ece6e5-95b5-4dbf-8fc5-48100143e215', 'e3c4b6718154d0ea3d34332c0599bc205f4d0da961d4dbe02e19189d7b47683a', '2026-04-19 20:15:04.983711+02', '20260419183000_user_full_name_en', NULL, NULL, '2026-04-19 20:15:04.948446+02', 1);


--
-- PostgreSQL database dump complete
--

\unrestrict Flvm6rgoIDciv8DJgL91sFR3KBgMVZmha298BtChw5yo1RGl60pnfQQkq9C7hKZ

