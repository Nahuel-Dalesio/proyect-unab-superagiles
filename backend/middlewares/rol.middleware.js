export const checkRole = (rolRequerido) => {
    return (req, res, next) => {
        // Asumimos que verifyToken ya guardó los datos del usuario en req.user
        if (!req.user) {
            return res.status(401).json({ mensaje: 'Usuario no autenticado' });
        }

        // Comparamos el rol del usuario con el que exige la ruta
        if (req.user.rol !== rolRequerido) {
            return res.status(403).json({ mensaje: 'Acceso denegado: permisos insuficientes' });
        }

        next();
    };
};