package main

import (
	"context"
	"fmt"

	"v-desktop/pkg/models"
	"v-desktop/pkg/services"
)

type App struct {
	ctx context.Context

	ratesSvc      *services.RatesService
	mortSvc       *services.MortalityService
	annuitySvc    *services.AnnuityService
	reserveSvc    *services.ReserveService
	riskSvc       *services.RiskService
	stochSvc      *services.StochasticService
	censusSvc     *services.CensusService
}

func NewApp() *App {
	mortSvc := services.NewMortalityService()
	return &App{
		ratesSvc:   services.NewRatesService(),
		mortSvc:    mortSvc,
		annuitySvc: services.NewAnnuityService(mortSvc),
		reserveSvc: services.NewReserveService(mortSvc),
		riskSvc:    services.NewRiskService(),
		stochSvc:   services.NewStochasticService(),
		censusSvc:  services.NewCensusService(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// === Rates ===

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) CalculatePV(rate, sumAssured float64, term int) float64 {
	return a.ratesSvc.PresentValue(rate, sumAssured, term)
}

func (a *App) CalculatePVStar(rate, j, sumAssured float64, term int) float64 {
	return a.ratesSvc.PresentValueStar(rate, j, sumAssured, term)
}

func (a *App) ProcessPV(req models.PVRequest) models.PVResponse {
	return a.ratesSvc.ProcessPV(req)
}

func (a *App) NominalToEffective(im float64, m int) float64 {
	return a.ratesSvc.NominalToEffective(im, m)
}

func (a *App) EffectiveToNominal(i float64, m int) float64 {
	return a.ratesSvc.EffectiveToNominal(i, m)
}

func (a *App) ForceOfInterest(i float64) float64 {
	return a.ratesSvc.ForceOfInterest(i)
}

func (a *App) InterestFromForce(delta float64) float64 {
	return a.ratesSvc.InterestFromForce(delta)
}

func (a *App) V(rate float64) float64 {
	return a.ratesSvc.V(rate)
}

func (a *App) VStar(rate, j float64) float64 {
	return a.ratesSvc.VStar(rate, j)
}

func (a *App) AnnuityCertainImmediate(i float64, n int) float64 {
	return a.ratesSvc.AnnuityCertainImmediate(i, n)
}

func (a *App) AnnuityCertainDue(i float64, n int) float64 {
	return a.ratesSvc.AnnuityCertainDue(i, n)
}

func (a *App) MacaulayDuration(i float64, cashFlows []float64) float64 {
	return a.ratesSvc.MacaulayDuration(i, cashFlows)
}

func (a *App) ModifiedDuration(i float64, cashFlows []float64) float64 {
	return a.ratesSvc.ModifiedDuration(i, cashFlows)
}

func (a *App) Convexity(i float64, cashFlows []float64) float64 {
	return a.ratesSvc.Convexity(i, cashFlows)
}

func (a *App) ConvertRate(req models.RateConvertRequest) models.RateConvertResponse {
	return a.ratesSvc.ConvertRate(req)
}

// === Mortality ===

func (a *App) GetTableNames() []string {
	return a.mortSvc.GetTableNames()
}

func (a *App) GetTableData(req models.TableDataRequest) (*models.TableDataResponse, error) {
	return a.mortSvc.GetTableData(req)
}

func (a *App) QueryQx(name string, age int) (float64, error) {
	return a.mortSvc.QueryQx(name, age)
}

func (a *App) QueryPx(name string, age, term int) (float64, error) {
	return a.mortSvc.QueryPx(name, age, term)
}

func (a *App) QueryEx(name string, age int) (float64, error) {
	return a.mortSvc.QueryEx(name, age)
}

func (a *App) LoadTableFromFile(name, filepath string) error {
	return a.mortSvc.LoadTableFromFile(name, filepath)
}

// === Annuities ===

func (a *App) CalcAnnuity(req models.AnnuityRequest) (models.AnnuityResponse, error) {
	return a.annuitySvc.CalcAnnuity(req)
}

// === Reserves ===

func (a *App) CalcReserve(req models.ReserveRequest) (models.ReserveResponse, error) {
	return a.reserveSvc.CalcReserve(req)
}

// === Risk ===

func (a *App) ComputeRiskMetrics(losses []float64) models.RiskResponse {
	return a.riskSvc.ComputeRiskMetrics(losses)
}

func (a *App) VaR(losses []float64, confidence float64) float64 {
	return a.riskSvc.VaR(losses, confidence)
}

func (a *App) CTE(losses []float64, confidence float64) float64 {
	return a.riskSvc.CTE(losses, confidence)
}

// === Stochastic ===

func (a *App) RunGBM(req models.MonteCarloRequest) models.MonteCarloResponse {
	return a.stochSvc.RunGBM(req)
}

func (a *App) RunVasicek(req models.MonteCarloRequest) models.MonteCarloResponse {
	return a.stochSvc.RunVasicek(req)
}

// === Census ===

func (a *App) ProcessCensus(req models.CensusRequest) (*models.CensusResponse, error) {
	return a.censusSvc.ProcessCensus(req)
}

func (a *App) ProcessCensusParallel(req models.CensusRequest) (*models.CensusResponse, error) {
	return a.censusSvc.ProcessCensusParallel(req)
}

func (a *App) GetCSVHeaders(filePath string) ([]string, error) {
	return a.censusSvc.GetCSVHeaders(filePath)
}
