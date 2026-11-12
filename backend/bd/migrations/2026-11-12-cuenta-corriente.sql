-- Agrega soporte para cuenta corriente preservando los datos existentes.

ALTER TABLE clientes
  ADD COLUMN cuenta_corriente_habilitada BOOLEAN NOT NULL DEFAULT false
    AFTER direccion,
  ADD COLUMN limite_credito DECIMAL(10,2) NOT NULL DEFAULT 0
    AFTER cuenta_corriente_habilitada,
  ADD COLUMN deuda_actual DECIMAL(10,2) NOT NULL DEFAULT 0
    AFTER limite_credito,
  ADD CONSTRAINT chk_clientes_limite_credito
    CHECK (limite_credito >= 0),
  ADD CONSTRAINT chk_clientes_deuda_actual
    CHECK (deuda_actual >= 0),
  ADD CONSTRAINT chk_clientes_deuda_limite
    CHECK (deuda_actual <= limite_credito);

ALTER TABLE ventas
  ADD COLUMN medio_pago ENUM(
    'efectivo',
    'debito',
    'credito',
    'transferencia',
    'qr',
    'cuenta_corriente'
  ) NULL AFTER id_cliente,
  ADD COLUMN estado_pago ENUM(
    'pagada',
    'pendiente',
    'cancelada'
  ) NOT NULL DEFAULT 'pagada' AFTER estado;

UPDATE ventas
SET medio_pago = CASE id_medio_pago
  WHEN 1 THEN 'efectivo'
  WHEN 2 THEN 'debito'
  WHEN 3 THEN 'credito'
  WHEN 4 THEN 'transferencia'
  WHEN 5 THEN 'qr'
END;

ALTER TABLE ventas
  MODIFY COLUMN medio_pago ENUM(
    'efectivo',
    'debito',
    'credito',
    'transferencia',
    'qr',
    'cuenta_corriente'
  ) NOT NULL,
  MODIFY COLUMN id_medio_pago INT NULL;