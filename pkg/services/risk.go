package services

import (
	"github.com/lubasinkal/v-star/pkg/risk"
	"v-desktop/pkg/models"
)

type RiskService struct{}

func NewRiskService() *RiskService {
	return &RiskService{}
}

func (s *RiskService) ComputeRiskMetrics(losses []float64) models.RiskResponse {
	if len(losses) == 0 {
		return models.RiskResponse{}
	}
	buf := make([]float64, len(losses))
	copy(buf, losses)
	r := risk.ComputeReport(buf)
	return models.RiskResponse{
		Mean:           r.Mean,
		StdDev:         r.StdDev,
		Min:            r.Min,
		Max:            r.Max,
		VaR95:          r.VaR95,
		VaR99:          r.VaR99,
		CTE95:          r.CTE95,
		CTE99:          r.CTE99,
		StdError:       r.StdError,
		Confidence95Lo: r.Confidence95Lo,
		Confidence95Hi: r.Confidence95Hi,
	}
}

func (s *RiskService) VaR(losses []float64, confidence float64) float64 {
	buf := make([]float64, len(losses))
	copy(buf, losses)
	return risk.VaR(buf, confidence)
}

func (s *RiskService) CTE(losses []float64, confidence float64) float64 {
	buf := make([]float64, len(losses))
	copy(buf, losses)
	return risk.CTE(buf, confidence)
}
